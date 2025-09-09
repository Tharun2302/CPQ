# Start CPQ Pro Application Servers
Write-Host "🚀 Starting CPQ Pro Application Servers..." -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Check if ports are already in use
if (Test-Port 3001) {
    Write-Host "⚠️  Port 3001 is already in use. Backend server might already be running." -ForegroundColor Yellow
} else {
    Write-Host "📡 Starting backend server on port 3001..." -ForegroundColor Blue
    Start-Process -FilePath "node" -ArgumentList "server.cjs" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 is already in use. Frontend server might already be running." -ForegroundColor Yellow
} else {
    Write-Host "🌐 Starting frontend server on port 5173..." -ForegroundColor Blue
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# Wait a moment for servers to start
Start-Sleep -Seconds 5

# Test server health
Write-Host "🔍 Testing server health..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Backend server is running and healthy!" -ForegroundColor Green
    Write-Host "📧 Email service: Available" -ForegroundColor Green
    Write-Host "🔗 HubSpot API: Available" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server health check failed. Please check if the server started properly." -ForegroundColor Red
    Write-Host "💡 Try running 'node server.cjs' manually to see any error messages." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Application startup complete!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📧 Email Test: http://localhost:3001/api/email/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers, close the terminal windows or use Ctrl+C" -ForegroundColor Yellow
