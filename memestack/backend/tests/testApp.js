// Test App Configuration
// Separate Express app for testing without database conflicts

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../routes/auth');
const memeRoutes = require('../routes/memes');
const uploadRoutes = require('../routes/upload');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'test'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
