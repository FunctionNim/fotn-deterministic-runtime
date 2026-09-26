@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Stop-LocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime did not stop cleanly.
  pause
  exit /b 1
)
echo FOTN Local Runtime stopped.
