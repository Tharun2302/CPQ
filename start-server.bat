@echo off
echo Starting CPQ Pro Server...
echo.
echo This will start the backend server for HubSpot integration.
echo Keep this window open to keep the server running.
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
node server.cjs

pause
