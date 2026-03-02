@echo off
echo Starting Flask server...
cd /d "%~dp0"
if exist ".venv311\Scripts\python.exe" (
  ".venv311\Scripts\python.exe" app.py
) else (
  python app.py
)
pause
