# 🧪 Testing Your First Express.js Server

## What We've Created So Far

### ✅ Files Created:
1. **server.js** - Main application file (Express.js server)
2. **config/database.js** - Database connection configuration
3. **models/User.js** - User data model (MongoDB schema)

### 🔧 Key Concepts You've Learned:

#### **Express.js Basics:**
- **app.use()** - Middleware functions (run on every request)
- **app.get()** - Handle GET requests
- **app.listen()** - Start the server on a port
- **Middleware** - Functions that process requests before they reach your routes

#### **MongoDB with Mongoose:**
- **Schema** - Defines the structure of your data
- **Model** - JavaScript class for interacting with database
- **Middleware** - Functions that run before/after saving data
- **Validation** - Ensures data meets requirements

#### **Security Concepts:**
- **Password Hashing** - Never store plain text passwords
- **Environment Variables** - Keep sensitive data secure
- **CORS** - Allow frontend to communicate with backend

## 🚀 Let's Test the Server!

### Step 1: Set Up Your Database Connection

**Option A: MongoDB Atlas (Recommended)**
1. Follow the MONGODB_SETUP.md guide
2. Get your connection string
3. Update your .env file with the Atlas connection string

**Option B: For Testing Only (Mock Database)**
We can test the server without database first, then add MongoDB later.

### Step 2: Start the Server

```bash
# Run the development server
npm run dev
```

### Expected Output:
```
🔄 Connecting to MongoDB...
✅ MongoDB Connected: cluster0-xyz.mongodb.net
📊 Database Name: memestack

🎉 ===================================
🚀 MemeStack Server Started!
📡 Port: 5000
🌍 Environment: development
🔗 Local URL: http://localhost:5000
📋 Health Check: http://localhost:5000/api/health
🎉 ===================================

📚 What you just learned:
✅ Express.js server setup
✅ Middleware configuration
✅ Database connection
✅ Error handling
✅ Environment variables
```

### Step 3: Test the API Endpoints

Open your browser or use a tool like Postman to test:

1. **Main endpoint**: http://localhost:5000
2. **Health check**: http://localhost:5000/api/health

## 🛠️ If You Get Errors:

### MongoDB Connection Error:
```
❌ MongoDB connection error: connect ENOTFOUND
```
**Solution**: Update your MONGODB_URI in .env file

### Port Already in Use:
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env file to 5001 or stop other servers

### Package Not Found:
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` to install dependencies

## 🎯 What's Next?

Once your server is running:
1. ✅ **Server Setup Complete** - Express.js server running
2. 🔄 **Create Authentication Routes** - Register and login APIs
3. 🔄 **Create Controllers** - Business logic for handling requests
4. 🔄 **Test with Real Data** - Create your first user account

Ready to test? Let's start the server! 🚀
