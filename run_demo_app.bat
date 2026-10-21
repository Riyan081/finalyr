@echo off
cd /d "%~dp0"
title DigiStore - CineGrade Pro Client
echo ========================================================
echo  DigiStore Software License Verification Demo
echo ========================================================
echo.
echo Launching CineGrade Pro Client App...
echo.

py -3 demo_client_app.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Trying standard 'python' command...
    python demo_client_app.py
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Python.
    echo Please make sure Python 3 is installed and added to PATH.
    pause
)
