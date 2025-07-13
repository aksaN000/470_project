// 💬 Comment Routes
// API endpoints for comment operations

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    toggleLikeComment,
    getReplies,
    reportComment,
    getUserComments
} = require('../controllers/commentController');

// Import middleware
const { protect, optionalAuth } = require('../middleware/auth');

// ========================================
// MEME COMMENTS ROUTES
// ========================================

// @route   GET /api/comments/memes/:memeId/comments
// @desc    Get comments for a meme
// @access  Public (but user-specific data if authenticated)
router.get('/memes/:memeId/comments', optionalAuth, getComments);

// @route   POST /api/comments/memes/:memeId/comments
// @desc    Add new comment to meme
// @access  Private
router.post('/memes/:memeId/comments', protect, addComment);

// ========================================
// COMMENT OPERATIONS ROUTES
// ========================================

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private (author only)
router.put('/:id', protect, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (author or admin only)
router.delete('/:id', protect, deleteComment);

// @route   POST /api/comments/:id/like
// @desc    Toggle like on comment
// @access  Private
router.post('/:id/like', protect, toggleLikeComment);

// @route   GET /api/comments/:id/replies
// @desc    Get replies to a comment
// @access  Public (but user-specific data if authenticated)
router.get('/:id/replies', optionalAuth, getReplies);

// @route   POST /api/comments/:id/report
// @desc    Report comment
// @access  Private
router.post('/:id/report', protect, reportComment);

// ========================================
// USER COMMENTS ROUTES
// ========================================

// @route   GET /api/users/:userId/comments
// @desc    Get user's comments
// @access  Public (but user-specific data if authenticated)
router.get('/users/:userId/comments', optionalAuth, getUserComments);

// ========================================
// API DOCUMENTATION ROUTE
// ========================================

// @route   GET /api/comments/docs
// @desc    Get API documentation for comments
// @access  Public
router.get('/docs', (req, res) => {
    res.json({
        title: 'MemeStack Comments API',
        version: '1.0.0',
        description: 'API endpoints for meme comment operations',
        baseUrl: '/api',
        endpoints: {
            public: {
                'GET /memes/:memeId/comments': {
                    description: 'Get comments for a meme',
                    params: 'memeId (required)',
                    query: 'page, limit, sortBy, sortOrder',
                    example: '/api/memes/60f3b4b3c45a2b1e8c123456/comments?page=1&limit=10'
                },
                'GET /comments/:id/replies': {
                    description: 'Get replies to a comment',
                    params: 'id (required)',
                    query: 'page, limit',
                    example: '/api/comments/60f3b4b3c45a2b1e8c123456/replies'
                },
                'GET /users/:userId/comments': {
                    description: 'Get user\'s comments',
                    params: 'userId (required)',
                    query: 'page, limit',
                    example: '/api/users/60f3b4b3c45a2b1e8c123456/comments'
                }
            },
            protected: {
                'POST /memes/:memeId/comments': {
                    description: 'Add new comment to meme',
                    auth: 'Bearer token required',
                    params: 'memeId (required)',
                    body: 'content (required), parentComment (optional)',
                    example: 'POST /api/memes/60f3b4b3c45a2b1e8c123456/comments'
                },
                'PUT /comments/:id': {
                    description: 'Update comment (author only)',
                    auth: 'Bearer token required',
                    params: 'id (required)',
                    body: 'content (required)',
                    example: 'PUT /api/comments/60f3b4b3c45a2b1e8c123456'
                },
                'DELETE /comments/:id': {
                    description: 'Delete comment (author or admin only)',
                    auth: 'Bearer token required',
                    params: 'id (required)',
                    example: 'DELETE /api/comments/60f3b4b3c45a2b1e8c123456'
                },
                'POST /comments/:id/like': {
                    description: 'Toggle like on comment',
                    auth: 'Bearer token required',
                    params: 'id (required)',
                    example: 'POST /api/comments/60f3b4b3c45a2b1e8c123456/like'
                },
                'POST /comments/:id/report': {
                    description: 'Report comment',
                    auth: 'Bearer token required',
                    params: 'id (required)',
                    body: 'reason (required), description (optional)',
                    example: 'POST /api/comments/60f3b4b3c45a2b1e8c123456/report'
                }
            }
        },
        reportReasons: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'other'],
        examples: {
            addComment: {
                content: 'This is hilarious! 😂',
                parentComment: null
            },
            addReply: {
                content: 'I totally agree!',
                parentComment: '60f3b4b3c45a2b1e8c123456'
            },
            updateComment: {
                content: 'Updated comment content'
            },
            reportComment: {
                reason: 'spam',
                description: 'This comment appears to be spam content'
            }
        }
    });
});

// Export the router
module.exports = router;
