@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-FOTNLocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime installation FAILED.
  pause
  exit /b 1
)
echo.
echo FOTN Local Runtime installation complete.
