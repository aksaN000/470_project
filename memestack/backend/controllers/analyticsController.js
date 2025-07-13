// 📊 Analytics Controller (MVC - Controller Layer)
// This handles all analytics-related HTTP requests and data aggregation

const Meme = require('../models/Meme');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

// @desc    Get user analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
    try {
        console.log('📊 Dashboard analytics requested for user:', req.user._id);
        console.log('📊 Time range:', req.query.timeRange || '30');
        
        const userId = req.user._id;
        const { timeRange = '30' } = req.query; // days

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Get user's memes
        const userMemes = await Meme.find({ creator: userId });
        const memeIds = userMemes.map(meme => meme._id);

        // Basic stats
        const totalMemes = userMemes.length;
        const totalLikes = userMemes.reduce((sum, meme) => sum + (meme.stats.likesCount || 0), 0);
        const totalViews = userMemes.reduce((sum, meme) => sum + (meme.stats.views || 0), 0);
        const totalShares = userMemes.reduce((sum, meme) => sum + (meme.stats.shares || 0), 0);
        const totalDownloads = userMemes.reduce((sum, meme) => sum + (meme.stats.downloads || 0), 0);

        // Comments on user's memes
        const totalComments = await Comment.countDocuments({ 
            meme: { $in: memeIds },
            status: 'approved'
        });

        // Follower stats
        const followersCount = await Follow.countDocuments({ 
            following: userId, 
            status: 'active' 
        });
        const followingCount = await Follow.countDocuments({ 
            follower: userId, 
            status: 'active' 
        });

        // Top performing memes
        const topMemes = await Meme.find({ creator: userId })
            .sort({ 'stats.likesCount': -1 })
            .limit(5)
            .select('title imageUrl stats createdAt category');

        // Recent activity (memes in time range)
        const recentMemes = await Meme.find({
            creator: userId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Engagement rate calculation
        const avgEngagement = totalMemes > 0 ? 
            ((totalLikes + totalComments + totalShares) / totalMemes) : 0;

        // Category breakdown
        const categoryStats = await Meme.aggregate([
            { $match: { creator: userId } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalLikes: { $sum: '$stats.likesCount' },
                    totalViews: { $sum: '$stats.views' },
                    avgLikes: { $avg: '$stats.likesCount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Growth metrics (compare with previous period)
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - parseInt(timeRange));
        
        const prevPeriodMemes = await Meme.find({
            creator: userId,
            createdAt: { $gte: prevStartDate, $lt: startDate }
        });

        const prevFollowersCount = await Follow.countDocuments({
            following: userId,
            status: 'active',
            createdAt: { $lt: startDate }
        });

        const growthMetrics = {
            memesGrowth: ((recentMemes.length - prevPeriodMemes.length) / Math.max(prevPeriodMemes.length, 1)) * 100,
            followersGrowth: followersCount > 0 ? 
                ((followersCount - prevFollowersCount) / Math.max(prevFollowersCount, 1)) * 100 : 0
        };

        // Daily activity for charts (last 7 days)
        const dailyActivity = await Meme.aggregate([
            {
                $match: {
                    creator: userId,
                    createdAt: { 
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    memesCreated: { $sum: 1 },
                    totalLikes: { $sum: '$stats.likesCount' },
                    totalViews: { $sum: '$stats.views' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalMemes,
                    totalLikes,
                    totalViews,
                    totalShares,
                    totalDownloads,
                    totalComments,
                    followersCount,
                    followingCount,
                    avgEngagement: Math.round(avgEngagement * 100) / 100
                },
                growth: growthMetrics,
                topMemes,
                categoryStats,
                dailyActivity,
                timeRange: parseInt(timeRange),
                generatedAt: new Date()
            },
            message: 'Analytics dashboard data fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data',
            error: error.message
        });
    }
};

// @desc    Get meme performance analytics
// @route   GET /api/analytics/meme/:memeId
// @access  Private (own memes only)
const getMemeAnalytics = async (req, res) => {
    try {
        const { memeId } = req.params;
        const userId = req.user._id;

        // Find meme and verify ownership
        const meme = await Meme.findOne({ 
            _id: memeId, 
            creator: userId 
        }).populate('creator', 'username');

        if (!meme) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or access denied'
            });
        }

        // Get comments for this meme
        const comments = await Comment.find({ 
            meme: memeId,
            status: 'approved' 
        })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(10);

        // Comment analytics
        const commentStats = await Comment.aggregate([
            { $match: { meme: memeId, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 },
                    totalLikes: { $sum: '$likes.count' },
                    avgSentiment: { $avg: '$sentiment.score' } // If you add sentiment analysis
                }
            }
        ]);

        // Engagement timeline (if you track view/like timestamps)
        const engagementTimeline = await Comment.aggregate([
            { $match: { meme: memeId, status: 'approved' } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    comments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Performance comparison with user's other memes
        const userAvgStats = await Meme.aggregate([
            { $match: { creator: userId, _id: { $ne: memeId } } },
            {
                $group: {
                    _id: null,
                    avgLikes: { $avg: '$stats.likesCount' },
                    avgViews: { $avg: '$stats.views' },
                    avgShares: { $avg: '$stats.shares' },
                    avgDownloads: { $avg: '$stats.downloads' }
                }
            }
        ]);

        const performance = userAvgStats.length > 0 ? {
            likesVsAvg: ((meme.stats.likesCount - userAvgStats[0].avgLikes) / Math.max(userAvgStats[0].avgLikes, 1)) * 100,
            viewsVsAvg: ((meme.stats.views - userAvgStats[0].avgViews) / Math.max(userAvgStats[0].avgViews, 1)) * 100,
            sharesVsAvg: ((meme.stats.shares - userAvgStats[0].avgShares) / Math.max(userAvgStats[0].avgShares, 1)) * 100
        } : null;

        res.status(200).json({
            success: true,
            data: {
                meme: {
                    id: meme._id,
                    title: meme.title,
                    description: meme.description,
                    imageUrl: meme.imageUrl,
                    category: meme.category,
                    createdAt: meme.createdAt,
                    stats: meme.stats
                },
                comments: {
                    recent: comments,
                    stats: commentStats[0] || {
                        totalComments: 0,
                        totalLikes: 0,
                        avgSentiment: 0
                    }
                },
                engagementTimeline,
                performance,
                generatedAt: new Date()
            },
            message: 'Meme analytics fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching meme analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meme analytics',
            error: error.message
        });
    }
};

// @desc    Get platform-wide analytics (for admin)
// @route   GET /api/analytics/platform
// @access  Private (Admin only)
const getPlatformAnalytics = async (req, res) => {
    try {
        // This would typically check for admin role
        // For now, we'll implement basic platform stats

        const { timeRange = '30' } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Platform overview
        const totalUsers = await User.countDocuments();
        const totalMemes = await Meme.countDocuments();
        const totalComments = await Comment.countDocuments({ status: 'approved' });
        const totalFollows = await Follow.countDocuments({ status: 'active' });

        // Recent activity
        const newUsers = await User.countDocuments({
            createdAt: { $gte: startDate }
        });
        const newMemes = await Meme.countDocuments({
            createdAt: { $gte: startDate }
        });

        // Top creators
        const topCreators = await Meme.aggregate([
            {
                $group: {
                    _id: '$creator',
                    memeCount: { $sum: 1 },
                    totalLikes: { $sum: '$stats.likesCount' },
                    totalViews: { $sum: '$stats.views' }
                }
            },
            { $sort: { totalLikes: -1 } },
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
                    memeCount: 1,
                    totalLikes: 1,
                    totalViews: 1
                }
            }
        ]);

        // Category distribution
        const categoryDistribution = await Meme.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalLikes: { $sum: '$stats.likesCount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalMemes,
                    totalComments,
                    totalFollows,
                    newUsers,
                    newMemes
                },
                topCreators,
                categoryDistribution,
                timeRange: parseInt(timeRange),
                generatedAt: new Date()
            },
            message: 'Platform analytics fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error fetching platform analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching platform analytics',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardAnalytics,
    getMemeAnalytics,
    getPlatformAnalytics
};
