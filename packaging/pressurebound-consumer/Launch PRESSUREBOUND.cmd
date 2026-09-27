@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Launch-PRESSUREBOUND.ps1"
if errorlevel 1 (
  echo.
  echo PRESSUREBOUND Local Runtime launch FAILED.
  pause
  exit /b 1
)
