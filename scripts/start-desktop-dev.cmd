@echo off
cd /d "%~dp0.."
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Test-NetConnection -ComputerName 127.0.0.1 -Port 5174 -InformationLevel Quiet)) { exit 0 } else { exit 1 }" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Reusing existing editor dev server on http://localhost:5174
  pnpm --dir apps\desktop exec tauri dev --config src-tauri\tauri.reuse-dev-server.conf.json
) else (
  echo Starting editor dev server through Tauri
  pnpm dev:desktop
)
