@echo off
echo Starting HTTP server on port 8080...
cd /d "%~dp0"
python -m http.server 8080
pause
