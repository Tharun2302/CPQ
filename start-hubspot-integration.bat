@echo off
echo ========================================
echo    CPQ Pro HubSpot Integration Setup
echo ========================================
echo.
echo This script will start the backend server for real HubSpot data.
echo.
echo IMPORTANT: Keep this window open to keep the server running!
echo.
echo Press any key to start the server...
pause > nul

echo.
echo Starting CPQ Pro Backend Server...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking dependencies...
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is available

echo.
echo [2/3] Installing dependencies...
npm install --silent
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/3] Starting backend server...
echo.
echo 🚀 Server will be available at: http://localhost:4000
echo 📡 HubSpot integration will use real data
echo.
echo ========================================
echo    SERVER IS STARTING...
echo ========================================
echo.
echo Keep this window open to keep the server running!
echo Press Ctrl+C to stop the server
echo.

node server.cjs

echo.
echo Server stopped. Press any key to exit...
pause > nul
