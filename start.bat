@echo off
title Pocket Money Tracker
cd /d "%~dp0"
echo Installing dependencies (first run only)...
if not exist node_modules (
  call npm install
)
echo.
echo Building and starting Pocket Money...
echo The app will open in your browser at http://localhost:4173
echo Press Ctrl+C in this window to stop the server.
echo.
call npm run start
pause