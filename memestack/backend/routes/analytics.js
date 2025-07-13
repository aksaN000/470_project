// 📊 Analytics Routes (MVC - Routes Layer)
// This defines all API endpoints for analytics operations

const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');

// Import controller functions
const {
    getDashboardAnalytics,
    getMemeAnalytics,
    getPlatformAnalytics
} = require('../controllers/analyticsController');

// ========================================
// USER ANALYTICS ROUTES
// ========================================

// @desc    Get user dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
// @params  ?timeRange=30 (days)
router.get('/dashboard', protect, getDashboardAnalytics);

// @desc    Get specific meme analytics
// @route   GET /api/analytics/meme/:memeId
// @access  Private (own memes only)
router.get('/meme/:memeId', protect, getMemeAnalytics);

// ========================================
// PLATFORM ANALYTICS ROUTES
// ========================================

// @desc    Get platform-wide analytics
// @route   GET /api/analytics/platform
// @access  Private (Admin only - future implementation)
router.get('/platform', protect, getPlatformAnalytics);

// ========================================
// ROUTE DOCUMENTATION & HELP
// ========================================

// Add route documentation endpoint
router.get('/help/routes', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API - Analytics Routes Documentation',
        routes: {
            user_analytics: {
                'GET /api/analytics/dashboard': {
                    description: 'Get user dashboard analytics and insights',
                    access: 'Private',
                    params: 'timeRange (optional, default: 30 days)',
                    example: 'GET /api/analytics/dashboard?timeRange=30',
                    returns: {
                        overview: 'Total stats (memes, likes, views, followers, etc.)',
                        growth: 'Growth metrics compared to previous period',
                        topMemes: 'Top 5 performing memes',
                        categoryStats: 'Performance breakdown by category',
                        dailyActivity: 'Daily activity chart data'
                    }
                },
                'GET /api/analytics/meme/:memeId': {
                    description: 'Get detailed analytics for specific meme',
                    access: 'Private (own memes only)',
                    params: 'memeId - ID of the meme',
                    example: 'GET /api/analytics/meme/60d0fe4f5311236168a109ca',
                    returns: {
                        meme: 'Meme details and stats',
                        comments: 'Recent comments and comment analytics',
                        engagementTimeline: 'Engagement over time',
                        performance: 'Performance vs user average'
                    }
                }
            },
            platform_analytics: {
                'GET /api/analytics/platform': {
                    description: 'Get platform-wide analytics (admin feature)',
                    access: 'Private (Admin)',
                    params: 'timeRange (optional)',
                    example: 'GET /api/analytics/platform?timeRange=7',
                    returns: {
                        overview: 'Platform totals and recent activity',
                        topCreators: 'Most successful creators',
                        categoryDistribution: 'Content category breakdown'
                    }
                }
            }
        },
        authentication: 'Include Bearer token in Authorization header',
        notes: [
            'Time ranges are specified in days',
            'All analytics are generated in real-time',
            'Growth metrics compare current period with previous period of same length',
            'Platform analytics require admin privileges'
        ]
    });
});

module.exports = router;
