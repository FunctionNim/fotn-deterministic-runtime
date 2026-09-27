@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Update-LocalRuntime.ps1"
set "FOTN_UPDATE_EXIT=%ERRORLEVEL%"
if not "%FOTN_UPDATE_EXIT%"=="0" (
  echo.
  echo FOTN Local Runtime update FAILED or was rolled back.
  pause
  exit /b %FOTN_UPDATE_EXIT%
)
echo.
echo FOTN Local Runtime update completed successfully.
pause
