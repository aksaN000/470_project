# 🚀 MemeStack Production Deployment Checklist

## Pre-Deployment Setup

### Step 1: Database Setup (MongoDB Atlas)
- [x] Connected to MongoDB Atlas cluster: `alif.wchm6bo.mongodb.net`
- [ ] Run the playground script (`playground-1.mongodb.js`) to set up collections
- [ ] Verify collections were created in MongoDB Atlas dashboard

### Step 2: Environment Configuration
- [ ] Update `.env` file with your actual MongoDB credentials:
  ```bash
  MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@alif.wchm6bo.mongodb.net/memestack?retryWrites=true&w=majority
  ```
- [ ] Generate a strong JWT secret (32+ characters)
- [ ] Update `CLIENT_URL` for production

### Step 3: Security Setup
- [ ] Create a secure JWT_SECRET (replace the default one)
- [ ] Set NODE_ENV to "production"
- [ ] Review CORS settings for your domain

### Step 4: Test Local Setup
- [ ] Install dependencies: `npm install` (both frontend and backend)
- [ ] Test backend: `npm start` in backend folder
- [ ] Test frontend: `npm start` in frontend folder
- [ ] Verify database connection works

## Deployment Options

### Option A: Simple VPS/Cloud Server
1. Upload code to server
2. Install Node.js and PM2
3. Configure environment variables
4. Build frontend: `npm run build`
5. Start backend with PM2: `pm2 start server.js`

### Option B: Platform-as-a-Service (Recommended for beginners)
- **Heroku**: Easy Git-based deployment
- **Railway**: Simple full-stack deployment
- **Render**: Free tier available
- **Vercel**: Great for frontend + API routes

### Option C: Docker Deployment
- Create Dockerfiles for frontend and backend
- Use docker-compose for orchestration
- Deploy to any container platform

## Quick Commands Reference

### Backend Commands
```bash
cd memestack/backend
npm install          # Install dependencies
npm start           # Start production server
npm run prod        # Start with production settings
```

### Frontend Commands
```bash
cd memestack/frontend
npm install          # Install dependencies
npm run build       # Build for production
npm start           # Start development server
```

### Database Connection Test
```javascript
// Run this in MongoDB playground to test connection
use('memestack');
db.users.countDocuments(); // Should return number of users
```

## Environment Variables Template

Create a `.env` file in `memestack/backend/` with:

```bash
# Server
PORT=5000
NODE_ENV=production

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@alif.wchm6bo.mongodb.net/memestack?retryWrites=true&w=majority

# Security (REQUIRED - Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# CORS
CLIENT_URL=https://your-domain.com

# File Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check username/password in connection string
2. **CORS Error**: Update CLIENT_URL to match your frontend domain
3. **File Upload Issues**: Ensure UPLOAD_PATH directory exists
4. **JWT Errors**: Make sure JWT_SECRET is set and long enough

### Health Check:
- Backend: `http://your-domain:5000/api/health`
- Database: Check collections in MongoDB Atlas dashboard

## Support Resources
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Express.js Documentation: https://expressjs.com/
- React Deployment: https://create-react-app.dev/docs/deployment/

---
**Next Steps**: 
1. Run the playground script first
2. Update your .env file with real credentials  
3. Test locally before deploying
