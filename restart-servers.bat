@echo off
echo Killing processes on ports 3000 and 5000...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
cd /d "g:\470 new\470_project\memestack\backend"
start "Backend" cmd /k "npm start"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
cd /d "g:\470 new\470_project\memestack\frontend"
set PORT=3000
start "Frontend" cmd /k "npm start"

echo Servers starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
pause
