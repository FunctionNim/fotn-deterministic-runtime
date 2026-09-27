@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Show-LocalRuntimeStatus.ps1"
echo.
pause
