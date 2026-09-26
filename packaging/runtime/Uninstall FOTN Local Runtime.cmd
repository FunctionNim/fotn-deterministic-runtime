@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Uninstall-LocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime uninstall FAILED.
  pause
  exit /b 1
)
