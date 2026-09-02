@echo off
title JARVIS Launcher
color 0b

echo =========================================================================
echo               J.A.R.V.I.S. - UNIVERSAL AI ASSISTANT
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on port 8000...
start "JARVIS Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting React Vite Frontend on port 5173...
start "JARVIS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Opening JARVIS in Microsoft Edge...
timeout /t 3 /nobreak >nul
start msedge http://localhost:5173

echo.
echo =========================================================================
echo  ALL JARVIS SYSTEMS ONLINE AND OPERATIONAL!
echo =========================================================================
exit
