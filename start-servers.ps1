# MemeStack Development Server Startup Script
# PowerShell version for better Windows compatibility

Write-Host "====================================" -ForegroundColor Green
Write-Host "🚀 MemeStack Development Environment" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check Node.js installation
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check project structure
if (!(Test-Path "memestack\backend\package.json")) {
    Write-Host "❌ Backend package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

if (!(Test-Path "memestack\frontend\package.json")) {
    Write-Host "❌ Frontend package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project structure verified!" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (!(Test-Path "memestack\backend\node_modules")) {
    Write-Host "📥 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location "memestack\backend"
    npm install
    Set-Location "..\..\"
}

if (!(Test-Path "memestack\frontend\node_modules")) {
    Write-Host "📥 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location "memestack\frontend"
    npm install
    Set-Location "..\..\"
}

# Start backend server
Write-Host "📦 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Write-Host "- Uses in-memory MongoDB for development" -ForegroundColor Gray
Write-Host "- All API routes will be available" -ForegroundColor Gray

$backendPath = Join-Path $PWD "memestack\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Starting backend server...' -ForegroundColor Green; npm run dev"

# Wait for backend to start
Write-Host ""
Write-Host "⏳ Waiting for backend to initialize (8 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start frontend server
Write-Host ""
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Write-Host "- React development server" -ForegroundColor Gray
Write-Host "- Will auto-open in browser" -ForegroundColor Gray

$frontendPath = Join-Path $PWD "memestack\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🚀 Starting frontend server...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Server Status:" -ForegroundColor White
Write-Host "├── Backend:  http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host "├── Frontend: http://localhost:3000" -ForegroundColor Gray  
Write-Host "└── Database: In-Memory MongoDB" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
Write-Host "- If connection errors occur, wait for servers to fully start" -ForegroundColor Gray
Write-Host "- Run health-check.js for detailed diagnostics" -ForegroundColor Gray
Write-Host "- Check that ports 3000 and 5000 are available" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to close this window"
