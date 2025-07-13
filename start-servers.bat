@echo off
title MemeStack Server Startup
color 0A

echo ====================================
echo 🚀 MemeStack Development Environment
echo ====================================
echo.

echo � Checking project structure...
if not exist "memestack\backend\package.json" (
    echo ❌ Backend package.json not found!
    echo Make sure you're running this from the project root.
    pause
    exit /b 1
)

if not exist "memestack\frontend\package.json" (
    echo ❌ Frontend package.json not found!
    echo Make sure you're running this from the project root.
    pause
    exit /b 1
)

echo ✅ Project structure verified!
echo.

echo 📦 Starting Backend Server (Port 5000)...
echo - Uses in-memory MongoDB for development
echo - All API routes will be available
start "🔧 MemeStack Backend" cmd /k "cd /d \"%~dp0memestack\backend\" && echo 🚀 Starting backend server... && npm run dev"

echo.
echo ⏳ Waiting for backend to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

echo.
echo 🎨 Starting Frontend Server (Port 3000)...
echo - React development server
echo - Will auto-open in browser
start "🌐 MemeStack Frontend" cmd /k "cd /d \"%~dp0memestack\frontend\" && echo 🚀 Starting frontend server... && npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo 📊 Server Status:
echo ├── Backend:  http://localhost:5000/api/health
echo ├── Frontend: http://localhost:3000  
echo └── Database: In-Memory MongoDB
echo.
echo 🔧 Troubleshooting:
echo • If routes show "not found": Backend may still be starting
echo • If connection fails: Check if ports 3000/5000 are free
echo • If no browser opens: Manually go to http://localhost:3000
echo.
echo Press any key to close this startup window...
pause >nul
