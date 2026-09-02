@echo off
setlocal enabledelayedexpansion
title JARVIS GitHub Sync & Backup
color 0b

echo =========================================================================
echo  JARVIS - PUSHING TO GITHUB (SK-developer24/JARVIS-voice-assistance)
echo =========================================================================
echo.

cd /d "%~dp0"

:: Auto-detect Git executable location
set "GIT_CMD=git"
where git >nul 2>&1
if errorlevel 1 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    ) else (
        echo [ERROR] Git is not installed or not found in system PATH.
        echo Please install Git from https://git-scm.com/downloads and try again.
        echo.
        pause
        exit /b 1
    )
)

echo Found Git at: !GIT_CMD!
echo.

echo [1/5] Initializing Git repository...
"!GIT_CMD!" init

echo.
echo [2/5] Setting default branch to main...
"!GIT_CMD!" branch -M main

echo.
echo [3/5] Setting remote repository origin...
"!GIT_CMD!" remote remove origin >nul 2>&1
"!GIT_CMD!" remote add origin https://github.com/SK-developer24/JARVIS-voice-assistance.git

echo.
echo [4/5] Staging files (.gitignore protected)...
"!GIT_CMD!" add .

echo.
echo [5/5] Creating commit...
"!GIT_CMD!" commit -m "feat: complete JARVIS AI Assistant with 3D Hologram, Multimodal Vision, Web RAG, and Phone Bridge"

echo.
echo =========================================================================
echo  PUSHING TO GITHUB MAIN BRANCH...
echo =========================================================================
"!GIT_CMD!" push -u origin main --force

echo.
if errorlevel 1 (
    echo [NOTICE] If GitHub requested login, make sure to authenticate in the browser popup.
) else (
    echo =========================================================================
    echo  SUCCESS! ALL CODE PUSHED TO GITHUB REPOSITORY!
    echo  https://github.com/SK-developer24/JARVIS-voice-assistance
    echo =========================================================================
)

echo.
pause
