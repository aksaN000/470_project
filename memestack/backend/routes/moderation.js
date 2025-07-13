const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get help information about all moderation endpoints
router.get('/help', (req, res) => {
    res.json({
        message: 'Moderation API Endpoints',
        endpoints: [
            {
                path: 'GET /api/moderation/help',
                description: 'Get help information about all moderation endpoints'
            },
            {
                path: 'POST /api/moderation/report',
                description: 'Submit a report for content or user'
            },
            {
                path: 'GET /api/moderation/reports',
                description: 'Get all reports (admin only)'
            },
            {
                path: 'PUT /api/moderation/reports/:id/review',
                description: 'Review a report (admin only)'
            },
            {
                path: 'PUT /api/moderation/reports/:id/dismiss',
                description: 'Dismiss a report (admin only)'
            },
            {
                path: 'GET /api/moderation/dashboard',
                description: 'Get moderation dashboard stats (admin only)'
            },
            {
                path: 'POST /api/moderation/users/:id/warn',
                description: 'Issue warning to user (admin only)'
            },
            {
                path: 'POST /api/moderation/users/:id/suspend',
                description: 'Suspend user (admin only)'
            },
            {
                path: 'POST /api/moderation/users/:id/ban',
                description: 'Ban user (admin only)'
            },
            {
                path: 'POST /api/moderation/users/:id/unban',
                description: 'Unban user (admin only)'
            }
        ]
    });
});

// Public Routes (require authentication)
router.post('/report', auth, moderationController.submitReport);

// Admin Routes (require admin privileges)
router.get('/reports', auth, adminAuth, moderationController.getReports);
router.put('/reports/:id/review', auth, adminAuth, moderationController.reviewReport);
router.put('/reports/:id/dismiss', auth, adminAuth, moderationController.dismissReport);
router.get('/dashboard', auth, adminAuth, moderationController.getModerationDashboard);
router.post('/users/:id/warn', auth, adminAuth, moderationController.warnUser);
router.post('/users/:id/suspend', auth, adminAuth, moderationController.suspendUser);
router.post('/users/:id/ban', auth, adminAuth, moderationController.banUser);
router.post('/users/:id/unban', auth, adminAuth, moderationController.unbanUser);

module.exports = router;
