@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Health-LocalRuntime.ps1"
if errorlevel 1 (
  echo.
  echo FOTN Local Runtime health check FAILED.
  pause
  exit /b 1
)
echo.
echo FOTN Local Runtime health check PASS.
