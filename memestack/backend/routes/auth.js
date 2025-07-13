// 🛣️ Authentication Routes
// This defines the API endpoints for authentication

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    register,
    login,
    getMe,
    updateProfile,
    logout
} = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// ========================================
// PRIVATE ROUTES (Authentication required)
// ========================================

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// Export the router
module.exports = router;
