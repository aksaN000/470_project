# 🚀 MemeStack Server Startup Guide

## Quick Start
1. **Run the batch file**: Double-click `start-servers.bat` in the project root
2. **Wait for both servers**: Backend (5000) and Frontend (3000)
3. **Open browser**: Navigate to http://localhost:3000

## Manual Startup (Alternative)

### Backend Server
```bash
cd "g:\470 project\memestack\backend"
npm run dev
```

### Frontend Server  
```bash
cd "g:\470 project\memestack\frontend"
npm start
```

## Health Checks

### Backend API Health
- URL: http://localhost:5000/api/health
- Should return: `{"status": "ok", "timestamp": "..."}`

### Frontend App
- URL: http://localhost:3000
- Should load the MemeStack application

## Common Issues & Solutions

### ❌ "Route not found" errors
**Cause**: Backend server not running
**Solution**: Start backend server first, then frontend

### ❌ "Failed to toggle like"
**Cause**: Backend API not accessible
**Solution**: Check backend is running on port 5000

### ❌ "Failed to create template"
**Cause**: API routes not available
**Solution**: Ensure both servers are running

### ❌ Connection refused
**Cause**: Wrong ports or servers not started
**Solution**: Use the batch file or start manually

## Port Configuration
- **Backend**: http://localhost:5000/api
- **Frontend**: http://localhost:3000
- **MongoDB**: Default port (if using local MongoDB)

## Environment Check
Make sure these files exist:
- `frontend/.env` (contains REACT_APP_API_URL=http://localhost:5000/api)
- `backend/.env` (contains database and other configs)

## Troubleshooting
1. Close all existing Node.js processes
2. Run the batch file as administrator if needed
3. Check if ports 3000 and 5000 are available
4. Verify MongoDB is running (if using local database)
