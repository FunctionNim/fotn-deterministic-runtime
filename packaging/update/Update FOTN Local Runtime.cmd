@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Update-LocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime update FAILED or was rolled back.
  pause
  exit /b 1
)
echo.
echo FOTN Local Runtime update completed successfully.
pause
