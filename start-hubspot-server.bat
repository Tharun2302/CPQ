@echo off
echo Starting CPQ Pro HubSpot Server...
echo.
echo This will start the backend server for HubSpot integration.
echo Make sure you have a valid HubSpot API key in your .env file.
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
node server.cjs

pause
