# 🔧 MemeStack API Connection Issues - SOLUTION

## ❌ Current Problem
You're experiencing these errors:
- `Route /api/comments/memes/xxx/comments not found`
- `Route /api/templates not found`
- `Failed to toggle like`
- `Failed to create template`

## 🎯 Root Cause
**The backend server is not running!** All API routes are correctly configured, but the Express server isn't started.

## ✅ SOLUTION - Start Both Servers

### 🚀 Quick Fix (Recommended)
1. **Double-click** `start-servers.bat` in the project root
2. **Wait** for both terminal windows to open
3. **Check** backend health: http://localhost:5000/api/health
4. **Open** frontend: http://localhost:3000

### 🔧 Manual Method
If the batch file doesn't work:

**Terminal 1 - Backend:**
```bash
cd "g:\470 project\memestack\backend"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "g:\470 project\memestack\frontend"  
npm start
```

## 🔍 Verification Steps

### 1. Backend Health Check
Visit: http://localhost:5000/api/health

**✅ Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T...",
  "environment": "development"
}
```

**❌ If you get an error:**
- Backend server is not running
- Wrong port or URL

### 2. Test API Routes
Once backend is running, these should work:
- http://localhost:5000/api/templates
- http://localhost:5000/api/memes
- http://localhost:5000/api/comments/docs

### 3. Frontend Connectivity
- Open http://localhost:3000
- Try creating a template
- Try liking a meme
- Try posting a comment

## 🛠️ Troubleshooting

### Port Conflicts
If you get "port already in use":
```bash
# Find what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Database Issues
The backend uses in-memory MongoDB for development, so no external database setup is needed.

### Still Having Issues?
1. **Check Node.js version**: `node --version` (should be 14+)
2. **Check npm version**: `npm --version`
3. **Reinstall dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

## 📊 System Architecture
```
Frontend (localhost:3000)
    ↓ API calls
Backend (localhost:5000/api)
    ↓ Database queries  
In-Memory MongoDB
```

## 🎉 After Fix
Once both servers are running, all these features will work:
- ✅ Create/edit/delete templates
- ✅ Like/unlike memes
- ✅ Post/edit/delete comments
- ✅ Upload images
- ✅ User authentication
- ✅ All other API features

The issue was simply that the backend API server wasn't running to handle the requests!
