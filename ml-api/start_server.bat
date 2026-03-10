@echo off
echo Starting Flask server...
cd /d "%~dp0"

REM Prefer system Python 3.11 env where dependencies are installed
set "PREFERRED_PY=C:\Users\suvarna bhinthaa K\AppData\Local\Programs\Python\Python311\python.exe"

if exist "%PREFERRED_PY%" (
  "%PREFERRED_PY%" app.py
) else if exist ".venv311\Scripts\python.exe" (
  ".venv311\Scripts\python.exe" app.py
) else (
  python app.py
)
pause
