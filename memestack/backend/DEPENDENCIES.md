# MemeStack Backend - Dependencies & Setup

## 📦 Dependencies Explained

### Production Dependencies (package.json)

#### 🚀 **express** - Web Framework
- **What it does**: Creates our web server and handles HTTP requests
- **Why we need it**: Core framework for building our REST API
- **Learning**: You'll learn how to create routes, handle requests/responses

#### 🗄️ **mongoose** - MongoDB Object Modeling
- **What it does**: Connects to MongoDB and provides schema-based modeling
- **Why we need it**: Makes working with MongoDB easier and safer
- **Learning**: You'll learn database operations, schemas, and data validation

#### 🔐 **dotenv** - Environment Variables
- **What it does**: Loads environment variables from .env file
- **Why we need it**: Keeps sensitive data (like database passwords) secure
- **Learning**: Best practices for managing configuration and secrets

#### 🌐 **cors** - Cross-Origin Resource Sharing
- **What it does**: Allows our frontend to communicate with backend
- **Why we need it**: Browsers block cross-origin requests by default
- **Learning**: Web security and how frontend/backend communicate

#### 🔒 **bcryptjs** - Password Hashing
- **What it does**: Encrypts user passwords before storing in database
- **Why we need it**: Never store plain text passwords (security!)
- **Learning**: Cryptography basics and user authentication security

#### 🎫 **jsonwebtoken** - JWT Authentication
- **What it does**: Creates and verifies authentication tokens
- **Why we need it**: Stateless authentication for our API
- **Learning**: Modern authentication patterns and session management

### Development Dependencies

#### 🔄 **nodemon** - Development Server
- **What it does**: Automatically restarts server when code changes
- **Why we need it**: Saves time during development
- **Learning**: Development workflow optimization

## 🔧 Installation Commands

If you need to reinstall everything from scratch:

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Or install individually:
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

## 📝 Package.json Scripts

Our package.json now includes these useful scripts:

```json
{
  "scripts": {
    "start": "node server.js",           // Production server
    "dev": "nodemon server.js",          // Development server
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 🌍 Environment Variables (.env)

We'll create a .env file for configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memestack
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 📋 System Requirements

- **Node.js**: v16.0.0 or higher ✅ (You have v22.12.0)
- **npm**: v7.0.0 or higher ✅ (You have v10.9.0)
- **MongoDB**: v4.4 or higher (We'll set this up next)

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Install new package
npm install package-name

# Install development package
npm install --save-dev package-name
```

## 📚 What You'll Learn

### Week 1-2 (Current Sprint):
1. **Express.js basics**: Routes, middleware, request/response handling
2. **MongoDB with Mongoose**: Database connection, schemas, CRUD operations
3. **Authentication**: JWT tokens, password hashing, protected routes
4. **API Design**: RESTful endpoints, status codes, error handling

### Next Sprints:
- File uploads and image processing
- Advanced database queries
- Frontend integration
- Testing and deployment

This setup gives you everything needed for a professional Node.js backend! 🎯
