// 🛡️ Moderation Controller (MVC - Controller Layer)
// This handles all moderation and reporting HTTP requests

const Report = require('../models/Report');
const Meme = require('../models/Meme');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Submit a report
// @route   POST /api/moderation/report
// @access  Private
const submitReport = async (req, res) => {
    try {
        const { reportType, contentId, reason, description } = req.body;
        const reporterId = req.user._id;

        // Validate report type and content
        if (!['meme', 'comment', 'user'].includes(reportType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        // Check if content exists
        let contentExists = false;
        const reportedContent = {};

        switch (reportType) {
            case 'meme':
                const meme = await Meme.findById(contentId);
                if (meme) {
                    contentExists = true;
                    reportedContent.meme = contentId;
                }
                break;
            case 'comment':
                const comment = await Comment.findById(contentId);
                if (comment) {
                    contentExists = true;
                    reportedContent.comment = contentId;
                }
                break;
            case 'user':
                const user = await User.findById(contentId);
                if (user) {
                    contentExists = true;
                    reportedContent.user = contentId;
                }
                break;
        }

        if (!contentExists) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Check if user has already reported this content
        const existingReport = await Report.findOne({
            reporter: reporterId,
            reportType,
            [`reportedContent.${reportType}`]: contentId
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this content'
            });
        }

        // Create the report
        const report = await Report.create({
            reporter: reporterId,
            reportType,
            reportedContent,
            reason,
            description: description || ''
        });

        // Populate the report for response
        const populatedReport = await Report.findById(report._id)
            .populate('reporter', 'username')
            .populate('reportedContent.meme', 'title imageUrl')
            .populate('reportedContent.comment', 'content')
            .populate('reportedContent.user', 'username email');

        res.status(201).json({
            success: true,
            data: populatedReport,
            message: 'Report submitted successfully'
        });

    } catch (error) {
        console.error('❌ Error submitting report:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting report',
            error: error.message
        });
    }
};

// @desc    Get all reports (admin only)
// @route   GET /api/moderation/reports
// @access  Private (Admin)
const getReports = async (req, res) => {
    try {
        const { 
            status = 'all',
            reportType = 'all',
            priority = 'all',
            page = 1,
            limit = 20
        } = req.query;

        // Build filter
        const filter = {};
        if (status !== 'all') filter.status = status;
        if (reportType !== 'all') filter.reportType = reportType;
        if (priority !== 'all') filter.priority = priority;

        // Get reports with pagination
        const skip = (page - 1) * limit;
        const reports = await Report.find(filter)
            .populate('reporter', 'username avatar')
            .populate('reportedContent.meme', 'title imageUrl creator')
            .populate('reportedContent.comment', 'content author')
            .populate('reportedContent.user', 'username email avatar')
            .populate('moderation.reviewedBy', 'username')
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReports = await Report.countDocuments(filter);

        // Get report statistics
        const stats = await Report.getReportStats();
        const reportsByType = await Report.getReportsByType();
        const pendingCount = await Report.getPendingReportsCount();

        res.status(200).json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalReports / limit),
                    totalCount: totalReports,
                    hasNext: page * limit < totalReports
                },
                statistics: {
                    statusBreakdown: stats,
                    typeBreakdown: reportsByType,
                    pendingCount
                }
            },
            message: 'Reports fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
};

// @desc    Review a report
// @route   PUT /api/moderation/reports/:reportId/review
// @access  Private (Admin)
const reviewReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { action, notes } = req.body;
        const reviewerId = req.user._id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Mark as reviewed
        await report.markAsReviewed(reviewerId, action, notes);

        // Take action based on the decision
        switch (action) {
            case 'content_removed':
                await handleContentRemoval(report);
                break;
            case 'content_flagged':
                await handleContentFlagging(report);
                break;
            case 'user_warned':
                await handleUserWarning(report);
                break;
            case 'user_suspended':
                await handleUserSuspension(report);
                break;
            case 'user_banned':
                await handleUserBan(report);
                break;
        }

        // Mark as resolved if action was taken
        if (action !== 'no_action') {
            await report.resolve(action, notes);
        }

        const updatedReport = await Report.findById(reportId)
            .populate('reporter', 'username')
            .populate('moderation.reviewedBy', 'username');

        res.status(200).json({
            success: true,
            data: updatedReport,
            message: 'Report reviewed successfully'
        });

    } catch (error) {
        console.error('❌ Error reviewing report:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing report',
            error: error.message
        });
    }
};

// @desc    Dismiss a report
// @route   PUT /api/moderation/reports/:reportId/dismiss
// @access  Private (Admin)
const dismissReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { notes } = req.body;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        await report.dismiss(notes);

        res.status(200).json({
            success: true,
            data: report,
            message: 'Report dismissed successfully'
        });

    } catch (error) {
        console.error('❌ Error dismissing report:', error);
        res.status(500).json({
            success: false,
            message: 'Error dismissing report',
            error: error.message
        });
    }
};

// @desc    Get moderation dashboard stats
// @route   GET /api/moderation/dashboard
// @access  Private (Admin)
const getModerationDashboard = async (req, res) => {
    try {
        const { timeRange = '30' } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Recent reports
        const recentReports = await Report.countDocuments({
            createdAt: { $gte: startDate }
        });

        // Reports by status
        const statusStats = await Report.getReportStats();
        
        // Reports by type
        const typeStats = await Report.getReportsByType();

        // Top reporters (users who report the most)
        const topReporters = await Report.aggregate([
            {
                $group: {
                    _id: '$reporter',
                    reportCount: { $sum: 1 }
                }
            },
            { $sort: { reportCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    username: { $arrayElemAt: ['$user.username', 0] },
                    reportCount: 1
                }
            }
        ]);

        // Moderation activity
        const moderationActivity = await Report.aggregate([
            {
                $match: {
                    'moderation.reviewedAt': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$moderation.reviewedBy',
                    reviewCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    username: { $arrayElemAt: ['$user.username', 0] },
                    reviewCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    recentReports,
                    pendingReports: await Report.getPendingReportsCount(),
                    totalReports: await Report.countDocuments()
                },
                statusStats,
                typeStats,
                topReporters,
                moderationActivity,
                timeRange: parseInt(timeRange)
            },
            message: 'Moderation dashboard data fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching moderation dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching moderation dashboard',
            error: error.message
        });
    }
};

// Helper functions for taking actions
const handleContentRemoval = async (report) => {
    switch (report.reportType) {
        case 'meme':
            await Meme.findByIdAndUpdate(report.reportedContent.meme, {
                isPublic: false,
                moderationStatus: 'removed',
                moderationReason: report.reason
            });
            break;
        case 'comment':
            await Comment.findByIdAndUpdate(report.reportedContent.comment, {
                status: 'removed',
                moderationReason: report.reason
            });
            break;
    }
};

const handleContentFlagging = async (report) => {
    switch (report.reportType) {
        case 'meme':
            await Meme.findByIdAndUpdate(report.reportedContent.meme, {
                moderationStatus: 'flagged',
                moderationReason: report.reason
            });
            break;
        case 'comment':
            await Comment.findByIdAndUpdate(report.reportedContent.comment, {
                status: 'flagged',
                moderationReason: report.reason
            });
            break;
    }
};

const handleUserWarning = async (report) => {
    const userId = report.reportedContent.user || 
                  (await getContentCreator(report.reportType, report.reportedContent));
    
    if (userId) {
        await User.findByIdAndUpdate(userId, {
            $inc: { 'moderation.warningCount': 1 },
            $push: {
                'moderation.warnings': {
                    reason: report.reason,
                    date: new Date(),
                    reportId: report._id
                }
            }
        });
    }
};

const handleUserSuspension = async (report) => {
    const userId = report.reportedContent.user || 
                  (await getContentCreator(report.reportType, report.reportedContent));
    
    if (userId) {
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + 7); // 7-day suspension
        
        await User.findByIdAndUpdate(userId, {
            'moderation.isSuspended': true,
            'moderation.suspensionEnd': suspensionEnd,
            'moderation.suspensionReason': report.reason
        });
    }
};

const handleUserBan = async (report) => {
    const userId = report.reportedContent.user || 
                  (await getContentCreator(report.reportType, report.reportedContent));
    
    if (userId) {
        await User.findByIdAndUpdate(userId, {
            'moderation.isBanned': true,
            'moderation.banReason': report.reason,
            'moderation.banDate': new Date()
        });
    }
};

const getContentCreator = async (contentType, reportedContent) => {
    switch (contentType) {
        case 'meme':
            const meme = await Meme.findById(reportedContent.meme);
            return meme?.creator;
        case 'comment':
            const comment = await Comment.findById(reportedContent.comment);
            return comment?.author;
        default:
            return null;
    }
};

// Warn user
const warnUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, reportId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add warning
        user.moderation.warningCount += 1;
        user.moderation.warnings.push({
            reason,
            reportId
        });
        user.moderation.lastViolation = new Date();

        await user.save();

        // Update report if provided
        if (reportId) {
            await Report.findByIdAndUpdate(reportId, {
                status: 'resolved',
                moderatorAction: 'warning_issued',
                resolvedAt: new Date()
            });
        }

        res.json({
            message: 'Warning issued successfully',
            warningCount: user.moderation.warningCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Suspend user
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, days, reportId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set suspension
        user.moderation.isSuspended = true;
        user.moderation.suspensionReason = reason;
        user.moderation.suspensionEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        user.moderation.lastViolation = new Date();

        await user.save();

        // Update report if provided
        if (reportId) {
            await Report.findByIdAndUpdate(reportId, {
                status: 'resolved',
                moderatorAction: 'user_suspended',
                resolvedAt: new Date()
            });
        }

        res.json({
            message: 'User suspended successfully',
            suspensionEnd: user.moderation.suspensionEnd
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Ban user
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, reportId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set ban
        user.moderation.isBanned = true;
        user.moderation.banReason = reason;
        user.moderation.banDate = new Date();
        user.moderation.lastViolation = new Date();

        await user.save();

        // Update report if provided
        if (reportId) {
            await Report.findByIdAndUpdate(reportId, {
                status: 'resolved',
                moderatorAction: 'user_banned',
                resolvedAt: new Date()
            });
        }

        res.json({
            message: 'User banned successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unban user
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove ban
        user.moderation.isBanned = false;
        user.moderation.banReason = '';
        user.moderation.banDate = undefined;

        await user.save();

        res.json({
            message: 'User unbanned successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitReport,
    getReports,
    reviewReport,
    dismissReport,
    getModerationDashboard,
    warnUser,
    suspendUser,
    banUser,
    unbanUser
};
