// 🚀 MemeStack Backend Server
// This is the main entry point of our application

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Get port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// ========================================
// INITIAL DATA SETUP
// ========================================

const createInitialData = async () => {
    try {
        console.log('� Server started - no demo data creation');
    } catch (error) {
        console.error('❌ Error during startup:', error.message);
    }
};

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
    // Add security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });
}

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON requests (allows us to receive JSON data)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Production request logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 ${req.method} ${req.originalUrl}`);
    }
    next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// DATABASE CONNECTION
// ========================================

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        
        // Priority 1: MongoDB Atlas (Production)
        if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
            console.log('🌐 Using MongoDB Atlas (Production)...');
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                retryWrites: true,
                w: 'majority',
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
            console.log(`📊 Database: ${conn.connection.name}`);
            return;
        }
        
        // Priority 2: Local MongoDB (Development)
        if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb://localhost')) {
            console.log('🏠 Using Local MongoDB (Development)...');
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
            console.log(`📊 Database: ${conn.connection.name}`);
            await createInitialData();
            return;
        }
        
        // Priority 3: In-memory database (Testing only)
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
            console.log('🧪 Using in-memory database (Development/Testing)...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            
            const mongod = new MongoMemoryServer({
                instance: { dbName: 'memestack' }
            });
            
            await mongod.start();
            const uri = mongod.getUri();
            
            const conn = await mongoose.connect(uri);
            console.log(`✅ In-Memory MongoDB Connected!`);
            console.log(`📊 Database: ${conn.connection.name} (temporary)`);
            console.log(`💡 Data will reset when server restarts`);
            
            // Store mongod instance for cleanup
            global.mongod = mongod;
            
            // Create initial data for development
            await createInitialData();
            return;
        }
        
        throw new Error('No valid MongoDB connection string found in environment variables');
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Setup Instructions:');
        console.log('   - For Production: Set MONGODB_URI to Atlas connection string');
        console.log('   - For Development: Set MONGODB_URI to local MongoDB');
        console.log('   - Check MONGODB_SETUP.md for detailed instructions');
        process.exit(1);
    }
};

// ========================================
// ROUTES SETUP
// ========================================

// Basic health check route
app.get('/', (req, res) => {
    res.json({
        message: '🎭 Welcome to MemeStack API!',
        status: 'Server is running',
        version: '1.0.0',
        endpoints: {
            health: 'GET /',
            auth: 'POST /api/auth/register, POST /api/auth/login',
            memes: 'GET /api/memes, POST /api/memes',
            upload: 'POST /api/upload/meme',
            trending: 'GET /api/memes/trending',
            help: 'GET /api/memes/help/routes'
        }
    });
});

// API health check with detailed system info
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    };
    
    // Add more details in development
    if (process.env.NODE_ENV === 'development') {
        healthStatus.details = {
            platform: process.platform,
            nodeVersion: process.version,
            databaseName: mongoose.connection.name
        };
    }
    
    res.json(healthStatus);
});

// Import and use route files
console.log('📝 Loading routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes loaded');
app.use('/api/memes', require('./routes/memes'));
console.log('✅ Memes routes loaded');
app.use('/api/upload', require('./routes/upload-simple-clean')); // Clean upload routes
console.log('✅ Upload routes loaded');
app.use('/api/comments', require('./routes/comments'));
console.log('✅ Comment routes loaded');
app.use('/api/follows', require('./routes/follows'));
console.log('✅ Follow routes loaded');
app.use('/api/analytics', require('./routes/analytics'));
console.log('✅ Analytics routes loaded');
app.use('/api/moderation', require('./routes/moderation'));
console.log('✅ Moderation routes loaded');
app.use('/api/folders', require('./routes/folders'));
console.log('✅ Folder routes loaded');
app.use('/api/templates', require('./routes/templates'));
console.log('✅ Template routes loaded');
app.use('/api/users', require('./routes/users'));
console.log('✅ User routes loaded');

// ========================================
// COLLABORATION FEATURE ROUTES
// ========================================
app.use('/api/challenges', require('./routes/challenges'));
console.log('✅ Challenge routes loaded');
app.use('/api/groups', require('./routes/groups'));
console.log('✅ Group routes loaded');
app.use('/api/collaborations', require('./routes/collaborations'));
console.log('✅ Collaboration routes loaded');

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// Handle 404 (Not Found) errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        tip: 'Check the API documentation for available routes'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    // Log error for debugging (in development) or monitoring (in production)
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', error.message);
        console.error('📍 Stack:', error.stack);
    } else {
        // In production, log errors to monitoring service
        console.error('Production Error:', {
            message: error.message,
            url: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: isDevelopment ? error.message : 'Internal Server Error',
        ...(isDevelopment && { 
            stack: error.stack,
            details: error.details 
        })
    });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();
        
        // Start the server
        const server = app.listen(PORT, () => {
            const isProduction = process.env.NODE_ENV === 'production';
            
            if (isProduction) {
                console.log('🚀 MemeStack Production Server Started');
                console.log(`📡 Port: ${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
                console.log(`📋 Health Check: /api/health`);
            } else {
                console.log('\n🎉 ===================================');
                console.log(`🚀 MemeStack Development Server Started!`);
                console.log(`📡 Port: ${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
                console.log(`🔗 Local URL: http://localhost:${PORT}`);
                console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
                console.log('🎉 ===================================\n');
            }
        });
        
        // Graceful shutdown setup
        process.on('SIGTERM', () => gracefulShutdown(server));
        process.on('SIGINT', () => gracefulShutdown(server));
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = async (server) => {
    console.log('\n🔄 Graceful shutdown initiated...');
    
    try {
        // Stop accepting new connections
        server.close(() => {
            console.log('✅ HTTP server closed');
        });
        
        // Close database connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
        // Clean up in-memory database if it exists
        if (global.mongod) {
            await global.mongod.stop();
            console.log('✅ In-memory database stopped');
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down server gracefully...');
    
    try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
        // Clean up in-memory database if it exists
        if (global.mongod) {
            await global.mongod.stop();
            console.log('✅ In-memory database stopped');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
});

// Start the server
startServer();

// Export app for testing purposes
module.exports = app;
