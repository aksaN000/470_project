// 👤 User Routes (MVC - Routes Layer)
// This defines all API endpoints for user operations

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getUsers,
    getUserById
} = require('../controllers/userController');

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// @desc    Get all users for browsing/discovery
// @route   GET /api/users
// @access  Public
router.get('/', getUsers);

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', getUserById);

// ========================================
// ROUTE DOCUMENTATION & HELP
// ========================================

// Add route documentation endpoint
router.get('/help/routes', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API - User Routes Documentation',
        routes: {
            discovery: {
                'GET /api/users': {
                    description: 'Browse all users for discovery',
                    access: 'Public',
                    parameters: {
                        page: 'Page number (default: 1)',
                        limit: 'Items per page (default: 20)',
                        search: 'Search by username or bio',
                        sortBy: 'Sort field (default: createdAt)',
                        sortOrder: 'Sort order: asc/desc (default: desc)'
                    },
                    example: 'GET /api/users?page=1&limit=20&search=john'
                },
                'GET /api/users/:id': {
                    description: 'Get user profile by ID',
                    access: 'Public',
                    params: 'id - User ID',
                    example: 'GET /api/users/60d0fe4f5311236168a109ca'
                }
            }
        },
        notes: [
            'All routes are public for user discovery',
            'User data is limited to public profile information only',
            'Sensitive information like email and preferences are not exposed'
        ]
    });
});

module.exports = router;
