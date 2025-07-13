// 👥 Follow Routes (MVC - Routes Layer)
// This defines all API endpoints for follow operations

const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');

// Import controller functions
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus,
    getFollowingFeed
} = require('../controllers/followController');

// ========================================
// FOLLOW MANAGEMENT ROUTES
// ========================================

// @desc    Follow a user
// @route   POST /api/follows/:userId
// @access  Private
router.post('/:userId', protect, followUser);

// @desc    Unfollow a user
// @route   DELETE /api/follows/:userId
// @access  Private
router.delete('/:userId', protect, unfollowUser);

// @desc    Check follow status
// @route   GET /api/follows/:userId/status
// @access  Private
router.get('/:userId/status', protect, getFollowStatus);

// ========================================
// FOLLOWERS & FOLLOWING LISTS
// ========================================

// @desc    Get user's followers
// @route   GET /api/follows/:userId/followers
// @access  Public
router.get('/:userId/followers', getFollowers);

// @desc    Get user's following list
// @route   GET /api/follows/:userId/following
// @access  Public
router.get('/:userId/following', getFollowing);

// ========================================
// FEED ROUTES
// ========================================

// @desc    Get feed of memes from followed users
// @route   GET /api/follows/feed
// @access  Private
router.get('/feed', protect, getFollowingFeed);

// ========================================
// ROUTE DOCUMENTATION & HELP
// ========================================

// Add route documentation endpoint
router.get('/help/routes', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API - Follow Routes Documentation',
        routes: {
            follow_management: {
                'POST /api/follows/:userId': {
                    description: 'Follow a user',
                    access: 'Private',
                    params: 'userId - ID of user to follow',
                    example: 'POST /api/follows/60d0fe4f5311236168a109ca'
                },
                'DELETE /api/follows/:userId': {
                    description: 'Unfollow a user',
                    access: 'Private',
                    params: 'userId - ID of user to unfollow',
                    example: 'DELETE /api/follows/60d0fe4f5311236168a109ca'
                },
                'GET /api/follows/:userId/status': {
                    description: 'Check if current user is following another user',
                    access: 'Private',
                    params: 'userId - ID of user to check',
                    example: 'GET /api/follows/60d0fe4f5311236168a109ca/status'
                }
            },
            lists: {
                'GET /api/follows/:userId/followers': {
                    description: 'Get list of user followers',
                    access: 'Public',
                    params: 'page, limit',
                    example: 'GET /api/follows/60d0fe4f5311236168a109ca/followers?page=1&limit=20'
                },
                'GET /api/follows/:userId/following': {
                    description: 'Get list of users being followed',
                    access: 'Public', 
                    params: 'page, limit',
                    example: 'GET /api/follows/60d0fe4f5311236168a109ca/following?page=1&limit=20'
                }
            },
            feed: {
                'GET /api/follows/feed': {
                    description: 'Get memes from followed users',
                    access: 'Private',
                    params: 'page, limit',
                    example: 'GET /api/follows/feed?page=1&limit=12'
                }
            }
        },
        authentication: 'Include Bearer token in Authorization header for private routes'
    });
});

module.exports = router;
