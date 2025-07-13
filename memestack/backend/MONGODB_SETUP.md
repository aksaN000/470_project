# 🗄️ MongoDB Setup Guide - Atlas (Cloud Database)

## Why MongoDB Atlas?
- ✅ **No local installation needed**
- ✅ **Professional cloud database**
- ✅ **Free tier available**
- ✅ **Automatic backups and scaling**
- ✅ **Same as production environment**

## 🚀 Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free"
3. Sign up with your email
4. Choose "Build a database"

### Step 2: Create a Free Cluster
1. Select **M0 Sandbox** (Free tier)
2. Choose your preferred cloud provider (AWS recommended)
3. Select a region close to you
4. Name your cluster (e.g., "memestack-cluster")
5. Click "Create Cluster"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `memestack-user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
   - IP: `0.0.0.0/0`
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. It looks like: `mongodb+srv://memestack-user:<password>@cluster.mongodb.net/`

### Step 6: Update Your .env File
Replace the connection string in your `.env` file:

```env
# Replace this line:
MONGODB_URI=mongodb://localhost:27017/memestack

# With your Atlas connection string:
MONGODB_URI=mongodb+srv://memestack-user:YOUR_PASSWORD@your-cluster.mongodb.net/memestack
```

**Important**: Replace `YOUR_PASSWORD` with the actual password you created!

## 🔧 Alternative: Local MongoDB Installation

If you prefer local installation:

### Windows Installation:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a service
5. Start MongoDB service

### Verify Installation:
```bash
mongod --version
mongo --version
```

### Default Local Connection:
```env
MONGODB_URI=mongodb://localhost:27017/memestack
```

## ✅ Next Steps
Once you have your MongoDB connection string:
1. Update your `.env` file
2. Test the database connection
3. Create your first database models

Which option would you like to use? 
- **Atlas (Recommended)**: Cloud database, no installation
- **Local**: Traditional local installation
