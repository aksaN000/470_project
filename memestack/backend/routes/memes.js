// 🛣️ Meme Routes (MVC - Routes Layer)
// This defines all API endpoints for meme operations

const express = require('express');
const router = express.Router();

// Import middleware
const { protect, optionalAuth } = require('../middleware/auth');

// Import controller functions
const {
    // Gallery & Browsing
    getAllMemes,
    getTrendingMemes,
    getMemesByCategory,
    getMemeById,
    
    // CRUD Operations
    createMeme,
    updateMeme,
    deleteMeme,
    
    // Social Interactions
    toggleLikeMeme,
    shareMeme,
    
    // User Collections
    getMyMemes,
    getUserMemes,
    
    // Download
    downloadMeme,
    
    // Statistics
    getMemeStats
} = require('../controllers/memeController');

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// @desc    Get all public memes with pagination and filtering
// @route   GET /api/memes
// @params  ?page=1&limit=12&category=funny&sortBy=createdAt&sortOrder=desc&search=cats&tags=funny,cute
router.get('/', optionalAuth, getAllMemes);

// @desc    Get trending memes (most liked in last 7 days)
// @route   GET /api/memes/trending
// @params  ?limit=10
router.get('/trending', optionalAuth, getTrendingMemes);

// @desc    Get general statistics about memes
// @route   GET /api/memes/stats
router.get('/stats', getMemeStats);

// @desc    Get memes by category
// @route   GET /api/memes/category/:category
// @params  :category (funny, reaction, gaming, etc.)
router.get('/category/:category', getMemesByCategory);

// @desc    Get memes by specific user (public memes only)
// @route   GET /api/memes/user/:userId
// @params  :userId
router.get('/user/:userId', getUserMemes);

// @desc    Get single meme by ID (public or private if owner)
// @route   GET /api/memes/:id
// @params  :id
// Note: Some features like viewing private memes require authentication
router.get('/:id', optionalAuth, getMemeById);

// @desc    Share meme (increment share count)
// @route   POST /api/memes/:id/share
// @params  :id
router.post('/:id/share', shareMeme);

// @desc    Download meme file
// @route   GET /api/memes/:id/download
// @params  :id
router.get('/:id/download', downloadMeme);

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================

// @desc    Get current user's memes (both public and private)
// @route   GET /api/memes/my-memes
// @params  ?includePrivate=true
router.get('/my-memes', protect, getMyMemes);

// @desc    Create/Upload new meme
// @route   POST /api/memes
// @body    { title, description, category, tags, isPublic, imageUrl, thumbnailUrl, metadata, memeData }
router.post('/', protect, createMeme);

// @desc    Update meme (only creator can update)
// @route   PUT /api/memes/:id
// @params  :id
// @body    { title, description, category, tags, isPublic }
router.put('/:id', protect, updateMeme);

// @desc    Delete meme (soft delete - only creator can delete)
// @route   DELETE /api/memes/:id
// @params  :id
router.delete('/:id', protect, deleteMeme);

// @desc    Like/Unlike meme
// @route   POST /api/memes/:id/like
// @params  :id
router.post('/:id/like', protect, toggleLikeMeme);

// ========================================
// ROUTE DOCUMENTATION & HELP
// ========================================

// Add route documentation endpoint
router.get('/help/routes', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API - Meme Routes Documentation',
        routes: {
            public: {
                'GET /api/memes': {
                    description: 'Get all public memes with pagination and filtering',
                    params: 'page, limit, category, sortBy, sortOrder, search, tags',
                    example: '/api/memes?page=1&limit=12&category=funny&search=cats'
                },
                'GET /api/memes/trending': {
                    description: 'Get trending memes (most liked in last 7 days)',
                    params: 'limit',
                    example: '/api/memes/trending?limit=10'
                },
                'GET /api/memes/stats': {
                    description: 'Get general statistics about memes',
                    params: 'none',
                    example: '/api/memes/stats'
                },
                'GET /api/memes/category/:category': {
                    description: 'Get memes by specific category',
                    params: 'category (funny, reaction, gaming, etc.)',
                    example: '/api/memes/category/funny'
                },
                'GET /api/memes/user/:userId': {
                    description: 'Get public memes by specific user',
                    params: 'userId',
                    example: '/api/memes/user/60f3b4b3c45a2b1e8c123456'
                },
                'GET /api/memes/:id': {
                    description: 'Get single meme by ID',
                    params: 'id',
                    example: '/api/memes/60f3b4b3c45a2b1e8c123456'
                },
                'POST /api/memes/:id/share': {
                    description: 'Share meme (increment share count)',
                    params: 'id',
                    example: '/api/memes/60f3b4b3c45a2b1e8c123456/share'
                }
            },
            protected: {
                'GET /api/memes/my-memes': {
                    description: 'Get current user\'s memes',
                    auth: 'Bearer token required',
                    params: 'includePrivate',
                    example: '/api/memes/my-memes?includePrivate=true'
                },
                'POST /api/memes': {
                    description: 'Create/Upload new meme',
                    auth: 'Bearer token required',
                    body: 'title, description, category, tags, isPublic, imageUrl, thumbnailUrl',
                    example: 'POST /api/memes with JSON body'
                },
                'PUT /api/memes/:id': {
                    description: 'Update meme (only creator)',
                    auth: 'Bearer token required',
                    params: 'id',
                    body: 'title, description, category, tags, isPublic',
                    example: 'PUT /api/memes/60f3b4b3c45a2b1e8c123456'
                },
                'DELETE /api/memes/:id': {
                    description: 'Delete meme (only creator)',
                    auth: 'Bearer token required',
                    params: 'id',
                    example: 'DELETE /api/memes/60f3b4b3c45a2b1e8c123456'
                },
                'POST /api/memes/:id/like': {
                    description: 'Like/Unlike meme',
                    auth: 'Bearer token required',
                    params: 'id',
                    example: 'POST /api/memes/60f3b4b3c45a2b1e8c123456/like'
                }
            }
        },
        categories: ['funny', 'reaction', 'gaming', 'sports', 'political', 'wholesome', 'dark', 'trending', 'custom'],
        sortOptions: ['createdAt', 'stats.likesCount', 'stats.views', 'title'],
        examples: {
            createMeme: {
                title: 'My Awesome Meme',
                description: 'This is a funny meme about cats',
                category: 'funny',
                tags: ['cats', 'funny', 'animals'],
                isPublic: true,
                imageUrl: 'https://example.com/meme.jpg',
                thumbnailUrl: 'https://example.com/thumb.jpg'
            },
            updateMeme: {
                title: 'Updated Meme Title',
                description: 'Updated description',
                category: 'reaction',
                tags: ['updated', 'meme'],
                isPublic: false
            }
        }
    });
});

module.exports = router;
