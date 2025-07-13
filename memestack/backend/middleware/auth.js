// 🛡️ Authentication Middleware
// This protects routes that require user authentication

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;
        
        // Check if authorization header exists and starts with 'Bearer'
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from "Bearer TOKEN"
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user by ID from token
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is valid but user not found'
                });
            }
            
            // Check if user account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }
            
            // Add user info to request object
            req.user = {
                _id: user._id,  // Add _id for compatibility
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            
            // Continue to next middleware/route handler
            next();
            
        } catch (jwtError) {
            console.error('❌ JWT verification error:', jwtError.message);
            
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// @desc    Check if user is admin
const adminOnly = (req, res, next) => {
    // This middleware should be used after protect middleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// @desc    Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        // Check if authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // If no token, continue without user info
        if (!token) {
            req.user = null;
            return next();
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user
            const user = await User.findById(decoded.userId);
            
            if (user && user.isActive) {
                req.user = {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
            } else {
                req.user = null;
            }
            
        } catch (jwtError) {
            // If token is invalid, continue without user info
            req.user = null;
        }
        
        next();
        
    } catch (error) {
        console.error('❌ Optional auth error:', error.message);
        req.user = null;
        next();
    }
};

module.exports = {
    protect,
    adminOnly,
    optionalAuth
};
