# Kill processes on specific ports and start servers
Write-Host "🔄 Killing processes on ports 3000 and 5000..." -ForegroundColor Yellow

# Kill processes on port 3000 (Frontend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess
    Write-Host "⚠️ Killing process $processId on port 3000" -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Kill processes on port 5000 (Backend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $processId = $port5000.OwningProcess
    Write-Host "⚠️ Killing process $processId on port 5000" -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "✅ Ports cleared!" -ForegroundColor Green

# Start Backend Server
Write-Host "🚀 Starting Backend Server on port 5000..." -ForegroundColor Cyan
cd "g:\470 new\470_project\memestack\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "🚀 Starting Frontend Server on port 3000..." -ForegroundColor Cyan
cd "g:\470 new\470_project\memestack\frontend"
$env:PORT = "3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT=3000; npm start" -WindowStyle Normal

Write-Host "✅ Servers starting up!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "🔗 Backend: http://localhost:5000" -ForegroundColor Magenta
