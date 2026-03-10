param(
  [string]$MysqlPath = "",
  [switch]$SkipSchemaImport,
  [switch]$SkipStartServer
)

$ErrorActionPreference = "Stop"

function Find-MysqlExe {
  param([string]$PreferredPath)

  if ($PreferredPath -and (Test-Path $PreferredPath)) {
    return (Resolve-Path $PreferredPath).Path
  }

  $candidates = @(
    "C:\Program Files\MySQL\MySQL Server 9.2\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $fromPath = Get-Command mysql.exe -ErrorAction SilentlyContinue
  if ($fromPath) {
    return $fromPath.Source
  }

  throw "mysql.exe was not found. Install MySQL or pass -MysqlPath."
}

function Read-EnvFile {
  param([string]$Path)

  $values = @{}

  if (!(Test-Path $Path)) {
    return $values
  }

  foreach ($line in Get-Content $Path) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith("#")) {
      continue
    }

    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
      $values[$parts[0]] = $parts[1]
    }
  }

  return $values
}

function Write-EnvFile {
  param(
    [string]$Path,
    [hashtable]$Values
  )

  $orderedKeys = @("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "PORT")
  $lines = foreach ($key in $orderedKeys) {
    if ($Values.ContainsKey($key)) {
      "$key=$($Values[$key])"
    }
  }

  Set-Content -Path $Path -Value $lines -Encoding ASCII
}

function ConvertTo-PlainText {
  param([System.Security.SecureString]$SecureString)

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function New-MysqlDefaultsFile {
  param([string]$Password)

  $tempFile = [System.IO.Path]::Combine(
    [System.IO.Path]::GetTempPath(),
    "mysql-client-$([System.Guid]::NewGuid().ToString('N')).cnf"
  )

  $content = @(
    "[client]"
    "password=$Password"
  )

  Set-Content -Path $tempFile -Value $content -Encoding ASCII
  return $tempFile
}

function Invoke-MysqlQuery {
  param(
    [string]$Exe,
    [string]$DbHost,
    [string]$Port,
    [string]$User,
    [string]$Password,
    [string]$Query
  )

  $defaultsFile = New-MysqlDefaultsFile -Password $Password
  $arguments = @(
    "--defaults-extra-file=$defaultsFile"
    "--protocol=TCP"
    "--host=$DbHost"
    "--port=$Port"
    "--user=$User"
    "--batch"
    "--raw"
    "--execute=$Query"
  )

  try {
    $output = & $Exe @arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw ($output | Out-String).Trim()
    }

    return $output
  } finally {
    Remove-Item $defaultsFile -Force -ErrorAction SilentlyContinue
  }
}

function Import-SchemaFile {
  param(
    [string]$Exe,
    [string]$DbHost,
    [string]$Port,
    [string]$User,
    [string]$Password,
    [string]$SchemaPath
  )

  $defaultsFile = New-MysqlDefaultsFile -Password $Password
  $arguments = @(
    "--defaults-extra-file=$defaultsFile"
    "--protocol=TCP"
    "--host=$DbHost"
    "--port=$Port"
    "--user=$User"
  )

  try {
    Get-Content $SchemaPath | & $Exe @arguments 2>&1 | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Schema import failed."
    }
  } finally {
    Remove-Item $defaultsFile -Force -ErrorAction SilentlyContinue
  }
}

function Normalize-Lines {
  param([object]$Output)

  return @($Output | ForEach-Object {
    if ($_ -ne $null) {
      $_.ToString().Trim()
    }
  } | Where-Object { $_ })
}

function Read-MySqlPassword {
  param([string]$UserName)

  $securePassword = Read-Host "Enter MySQL password for $UserName" -AsSecureString
  return ConvertTo-PlainText -SecureString $securePassword
}

function Test-MysqlConnection {
  param(
    [string]$Exe,
    [string]$DbHost,
    [string]$Port,
    [string]$User,
    [string]$Password
  )

  Invoke-MysqlQuery -Exe $Exe -DbHost $DbHost -Port $Port -User $User -Password $Password -Query "SELECT VERSION();" | Out-Null
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"
$schemaPath = Join-Path $projectRoot "schema.sql"

if (!(Test-Path $schemaPath)) {
  throw "schema.sql was not found at $schemaPath"
}

$envValues = Read-EnvFile -Path $envPath
if (!$envValues.ContainsKey("DB_HOST")) { $envValues["DB_HOST"] = "127.0.0.1" }
if (!$envValues.ContainsKey("DB_PORT")) { $envValues["DB_PORT"] = "3307" }
if (!$envValues.ContainsKey("DB_USER")) { $envValues["DB_USER"] = "root" }
if (!$envValues.ContainsKey("DB_NAME")) { $envValues["DB_NAME"] = "parkinsons_db" }
if (!$envValues.ContainsKey("PORT")) { $envValues["PORT"] = "5000" }

$mysqlExe = Find-MysqlExe -PreferredPath $MysqlPath
$dbPassword = $envValues["DB_PASSWORD"]

if ([string]::IsNullOrWhiteSpace($dbPassword) -or $dbPassword -eq "your_mysql_password") {
  $dbPassword = Read-MySqlPassword -UserName $envValues["DB_USER"]
}

if ([string]::IsNullOrWhiteSpace($dbPassword)) {
  throw "A MySQL password is required."
}

Write-Host "Using MySQL client: $mysqlExe"
Write-Host "Testing MySQL connection on $($envValues["DB_HOST"]):$($envValues["DB_PORT"]) ..."
try {
  Test-MysqlConnection -Exe $mysqlExe -DbHost $envValues["DB_HOST"] -Port $envValues["DB_PORT"] -User $envValues["DB_USER"] -Password $dbPassword
} catch {
  if ($_.Exception.Message -like "*ERROR 1045*") {
    Write-Host "Stored MySQL password was rejected. Please re-enter it." -ForegroundColor Yellow
    $dbPassword = Read-MySqlPassword -UserName $envValues["DB_USER"]
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
      throw "A MySQL password is required."
    }
    Test-MysqlConnection -Exe $mysqlExe -DbHost $envValues["DB_HOST"] -Port $envValues["DB_PORT"] -User $envValues["DB_USER"] -Password $dbPassword
  } else {
    throw
  }
}

$envValues["DB_PASSWORD"] = $dbPassword
Write-EnvFile -Path $envPath -Values $envValues

Write-Host "Connected to MySQL"

if (-not $SkipSchemaImport) {
  Write-Host "Importing schema.sql ..."
  Import-SchemaFile -Exe $mysqlExe -DbHost $envValues["DB_HOST"] -Port $envValues["DB_PORT"] -User $envValues["DB_USER"] -Password $dbPassword -SchemaPath $schemaPath
  Write-Host "Database $($envValues["DB_NAME"]) ready"
}

Write-Host "Verifying database tables ..."
$tables = Invoke-MysqlQuery -Exe $mysqlExe -DbHost $envValues["DB_HOST"] -Port $envValues["DB_PORT"] -User $envValues["DB_USER"] -Password $dbPassword -Query "USE $($envValues["DB_NAME"]); SHOW TABLES;"
$tableNames = Normalize-Lines -Output $tables | Select-Object -Skip 1
$expectedTables = @("doctors", "patients", "predictions", "reports")
$missingTables = @($expectedTables | Where-Object { $_ -notin $tableNames })

if ($missingTables.Count -gt 0) {
  throw "Missing expected tables: $($missingTables -join ', ')"
}

Write-Host "Tables verified: patients, doctors, predictions, reports"

if (-not $SkipStartServer) {
  Write-Host "Starting backend server ..."
  Push-Location $projectRoot
  try {
    node server/server.js
  } finally {
    Pop-Location
  }
}
