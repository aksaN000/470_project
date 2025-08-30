# MemeStack - Meme Management & Design Platform

A full-stack web application for creating, sharing, and collaborating on memes. Built with React, Node.js, Express, and MongoDB.

## 🌐 Live Deployment

** Application is now live on Vercel!**

- **Frontend**: [https://470-project-25ao.vercel.app](https://470-project-25ao.vercel.app)
- **Backend API**: [https://470-project.vercel.app](https://470-project.vercel.app)
- **Health Check**: [https://470-project.vercel.app/api/health](https://470-project.vercel.app/api/health)

##  Features

- **Meme Creation**: Advanced meme editor with templates
- **User Management**: Registration, authentication, profiles
- **Collaboration**: Real-time collaborative meme editing
- **Templates**: Browse and create custom meme templates
- **Social Features**: Follow users, like memes, comments
- **Gallery**: Browse and search through memes
- **Responsive Design**: Works on desktop and mobile

##  Tech Stack

### Frontend
- React 19.1.0
- Material-UI (MUI) 7.2.0
- React Router 7.6.3
- Axios for API calls

### Backend
- Node.js with Express 5.1.0
- MongoDB with Mongoose 8.16.3
- JWT Authentication
- Multer for file uploads
- Sharp for image processing

### Database
- MongoDB Atlas (Production)
- Collections: Users, Memes, Templates, Collaborations, Follows

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (for production)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 470_project
   ```

2. **Backend Setup**
   ```bash
   cd memestack/backend
   npm install
   
   # Copy environment template and configure
   cp .env.template .env
   # Edit .env with your MongoDB Atlas connection string
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   - Set up MongoDB Atlas cluster
   - Run the playground script (`playground-1.mongodb.js`) to initialize collections

5. **Start the Application**
   ```bash
   # Backend (Terminal 1)
   cd memestack/backend
   npm start
   
   # Frontend (Terminal 2)
   cd memestack/frontend
   npm start
   ```

## 🌐 Application URLs

### Live Production (Vercel)
- **Frontend**: [https://470-project-25ao.vercel.app](https://470-project-25ao.vercel.app)
- **Backend API**: [https://470-project.vercel.app](https://470-project.vercel.app)
- **Health Check**: [https://470-project.vercel.app/api/health](https://470-project.vercel.app/api/health)

### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
470_project/
├── memestack/
│   ├── backend/           # Express.js API server
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # API route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   ├── frontend/          # React application
│   │   ├── public/        # Static assets
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── pages/      # Page components
│   │       ├── services/   # API services
│   │       └── styles/     # Styling
│   └── playground-1.mongodb.js  # Database setup script
├── DEPLOYMENT.md          # Deployment guide
└── DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
```

## 🔐 Environment Variables

### Backend (.env)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/memestack
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```bash
# For local development
REACT_APP_API_URL=http://localhost:5000/api

# For production (Vercel deployment)
# REACT_APP_API_URL=https://470-project.vercel.app/api

REACT_APP_NAME=MemeStack
REACT_APP_VERSION=1.0.0
```

## 🚀 Deployment

✅ **Currently deployed on Vercel**

The application is live and running on Vercel's platform:
- **Frontend**: Deployed as a static React build
- **Backend**: Deployed as Vercel serverless functions
- **Database**: MongoDB Atlas (cloud-hosted)

### Deployment Features:
- ✅ Automatic deployments from Git
- ✅ HTTPS enabled by default
- ✅ Global CDN distribution
- ✅ Serverless architecture
- ✅ Environment variable management

For detailed deployment instructions and alternative platforms, see `DEPLOYMENT.md`.

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Memes
- `GET /api/memes` - Get all memes
- `POST /api/memes` - Create new meme
- `GET /api/memes/:id` - Get specific meme
- `PUT /api/memes/:id` - Update meme
- `DELETE /api/memes/:id` - Delete meme

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/:id` - Get specific template

### Users & Social
- `GET /api/users/:id` - Get user profile
- `POST /api/follows` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user followers

## 🧪 Health Check

The application includes a health check endpoint at `/api/health` that returns:
- Server status
- Database connection status
- Current timestamp

## 📄 License

This project is part of a course assignment and is for educational purposes.

## 🤝 Contributing

This is a course project. For issues or suggestions, please contact the development team.

## 📞 Support

For technical support or questions about deployment, refer to:
- `DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist


