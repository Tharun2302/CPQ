@echo off
echo ========================================
echo    CPQ Pro Frontend Development
echo ========================================
echo.
echo This script will start the frontend development server.
echo.
echo IMPORTANT: Make sure the backend server is running first!
echo Run start-hubspot-integration.bat in another window.
echo.
echo Press any key to start the frontend...
pause > nul

echo.
echo Starting CPQ Pro Frontend...
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
echo [2/3] Installing frontend dependencies...
npm install --silent
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/3] Starting frontend development server...
echo.
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔗 HubSpot integration will connect to backend at: http://localhost:4000
echo.
echo ========================================
echo    FRONTEND IS STARTING...
echo ========================================
echo.
echo Keep this window open to keep the frontend running!
echo Press Ctrl+C to stop the frontend
echo.

npm run dev

echo.
echo Frontend stopped. Press any key to exit...
pause > nul
