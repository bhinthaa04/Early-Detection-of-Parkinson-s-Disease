@echo off
echo Starting Flask server...
cd /d "%~dp0"

REM Prefer dedicated TensorFlow environment (short path to avoid Windows long-path issues)
set "PREFERRED_PY=C:\Users\suvarna bhinthaa K\tfenv311\Scripts\python.exe"

if exist "%PREFERRED_PY%" (
  "%PREFERRED_PY%" app.py
) else if exist ".venv311\Scripts\python.exe" (
  ".venv311\Scripts\python.exe" app.py
) else (
  python app.py
)
pause
