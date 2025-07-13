// 🖼️ Simple Image Upload Routes (Testing)
// Basic upload route to test functionality

console.log('🔧 Loading upload-simple.js...');

const express = require('express');
const router = express.Router();
const multer = require('multer');

console.log('📦 Dependencies loaded for upload routes');

// Import middleware
const { protect } = require('../middleware/auth');

console.log('🔐 Auth middleware imported');

// Simple memory storage for testing
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    }
});

console.log('📸 Multer configured for upload routes');

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Upload routes are working!'
    });
});

// Test protected route  
router.get('/protected-test', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Protected upload route working!',
        user: req.user.username
    });
});

// Simple upload test
router.post('/simple', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully!',
            data: {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// Test route 1
router.get('/test1', (req, res) => {
    res.json({ message: 'Test route 1 working' });
});

// Test route 2
router.get('/test2', (req, res) => {
    res.json({ message: 'Test route 2 working' });
});

// Simple meme upload route for testing  
router.post('/meme', (req, res) => {
    res.json({ message: 'Meme route is working', method: 'POST' });
});

// Test route 3
router.get('/test3', (req, res) => {
    res.json({ message: 'Test route 3 working' });
});

console.log('🎯 Upload routes defined successfully');

module.exports = router;
