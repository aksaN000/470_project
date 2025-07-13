// 🔐 Authentication Controller (MVC - Controller Layer)
// This handles all authentication-related HTTP requests

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ========================================
// HELPER FUNCTIONS
// ========================================

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Send response with token
const sendTokenResponse = (user, statusCode, res, message) => {
    // Generate token
    const token = generateToken(user._id);
    
    // Remove password from user object
    const userResponse = user.toJSON();
    
    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: userResponse
    });
};

// ========================================
// AUTHENTICATION CONTROLLERS
// ========================================

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body.username);
        
        // Extract data from request body
        const { username, email, password } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });
        
        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }
        
        // Create new user
        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password
        });
        
        console.log('✅ User created successfully:', user.username);
        
        // Send response with token
        sendTokenResponse(user, 201, res, 'User registered successfully');
        
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${message}`
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        console.log('🔑 Login attempt:', req.body.identifier);
        
        // Extract data from request body
        const { identifier, password } = req.body; // identifier can be email or username
        
        // Validation
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/username and password'
            });
        }
        
        // Find user by email or username (with password field)
        const user = await User.findByCredentials(identifier);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check if password matches
        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }
        
        console.log('✅ Login successful:', user.username);
        
        // Send response with token
        sendTokenResponse(user, 200, res, 'Login successful');
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (requires token)
const getMe = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            user: user.toJSON()
        });
        
    } catch (error) {
        console.error('❌ Get user error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error getting user data'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { bio, theme, notifications } = req.body;
        
        // Find user
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update profile fields
        if (bio !== undefined) user.profile.bio = bio;
        if (theme !== undefined) user.preferences.theme = theme;
        if (notifications !== undefined) user.preferences.notifications = notifications;
        
        // Save updated user
        await user.save();
        
        console.log('✅ Profile updated:', user.username);
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
        
    } catch (error) {
        console.error('❌ Update profile error:', error.message);
        
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${message}`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// @desc    Logout user (optional - mainly for client-side)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // In JWT-based auth, logout is mainly handled client-side
        // by removing the token from storage
        
        console.log('👋 User logged out:', req.user.userId);
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        console.error('❌ Logout error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// Export all controller functions
module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    logout
};
