# CPQ Pro HubSpot Integration - Complete Startup Script
# This script will start both the backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CPQ Pro HubSpot Integration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will start both servers for real HubSpot data." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is available
Write-Host "Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is available: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""

# Start backend server in background
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "🚀 Backend server will be available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📡 HubSpot integration will use real data" -ForegroundColor Cyan
Write-Host ""

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.cjs
}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Test backend server
Write-Host "Testing backend server..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend server is running successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Backend server responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Backend server might still be starting..." -ForegroundColor Yellow
}

Write-Host ""

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Green
Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔗 HubSpot integration will connect to backend at: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SERVERS ARE STARTING..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep this window open to keep both servers running!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start frontend server (this will keep the script running)
npm run dev

# Cleanup when script is stopped
Write-Host ""
Write-Host "Stopping servers..." -ForegroundColor Yellow
Stop-Job $backendJob
Remove-Job $backendJob
Write-Host "Servers stopped. Press Enter to exit..." -ForegroundColor Yellow
Read-Host
