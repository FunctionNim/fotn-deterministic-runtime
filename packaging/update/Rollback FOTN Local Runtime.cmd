@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Rollback-LocalRuntime.ps1"
set "FOTN_ROLLBACK_EXIT=%ERRORLEVEL%"
if not "%FOTN_ROLLBACK_EXIT%"=="0" (
  echo.
  echo FOTN Local Runtime rollback FAILED or restored the original current version.
  pause
  exit /b %FOTN_ROLLBACK_EXIT%
)
echo.
echo FOTN Local Runtime rollback completed successfully.
pause
