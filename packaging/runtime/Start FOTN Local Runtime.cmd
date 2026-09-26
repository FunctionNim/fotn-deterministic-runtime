@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Start-LocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime failed to start.
  pause
  exit /b 1
)
echo FOTN Local Runtime is running on localhost.
