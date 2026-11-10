@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  start "" "%~dp0start.html"
  exit /b
)
node local-server.cjs 4186 --open
pause
