// 🔔 Collaboration Activity Controller
// Advanced activity tracking and notification system

const Collaboration = require('../models/Collaboration');
const User = require('../models/User');

// Get collaboration activity feed
const getCollaborationActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20 } = req.query;
        
        const collaboration = await Collaboration.findById(id)
            .populate('versions.createdBy', 'username profile.displayName profile.avatar')
            .populate('comments.user', 'username profile.displayName profile.avatar')
            .populate('collaborators.user', 'username profile.displayName profile.avatar');
        
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }
        
        // Build activity feed from versions, comments, and collaborator changes
        const activities = [];
        
        // Add version activities
        collaboration.versions.forEach(version => {
            activities.push({
                type: 'version_created',
                user: version.createdBy,
                timestamp: version.createdAt,
                details: {
                    versionNumber: version.version,
                    title: version.title,
                    description: version.description
                }
            });
        });
        
        // Add comment activities
        collaboration.comments.forEach(comment => {
            activities.push({
                type: 'comment_added',
                user: comment.user,
                timestamp: comment.createdAt,
                details: {
                    content: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
                    versionNumber: comment.versionNumber
                }
            });
        });
        
        // Add collaborator join activities
        collaboration.collaborators.forEach(collab => {
            activities.push({
                type: 'user_joined',
                user: collab.user,
                timestamp: collab.joinedAt,
                details: {
                    role: collab.role
                }
            });
        });
        
        // Sort by timestamp (newest first) and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limitedActivities = activities.slice(0, parseInt(limit));
        
        res.json({
            success: true,
            activities: limitedActivities,
            totalCount: activities.length
        });
    } catch (error) {
        console.error('Error getting collaboration activity:', error);
        res.status(500).json({ message: 'Error fetching activity feed', error: error.message });
    }
};

// Track user activity
const trackUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.userId;
        const { action, details = {} } = req.body;
        
        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }
        
        // Update user's last active time
        const collaborator = collaboration.collaborators.find(c => 
            c.user.toString() === userId.toString()
        );
        
        if (collaborator) {
            collaborator.lastActive = new Date();
            
            // Update contribution score based on action
            switch (action) {
                case 'version_created':
                    collaborator.contributionScore += 15;
                    break;
                case 'comment_added':
                    collaborator.contributionScore += 5;
                    break;
                case 'invite_sent':
                    collaborator.contributionScore += 10;
                    break;
                case 'version_approved':
                    collaborator.contributionScore += 8;
                    break;
                default:
                    collaborator.contributionScore += 1;
            }
            
            await collaboration.save();
        }
        
        res.json({ 
            success: true, 
            message: 'Activity tracked successfully',
            contributionScore: collaborator?.contributionScore || 0
        });
    } catch (error) {
        console.error('Error tracking user activity:', error);
        res.status(500).json({ message: 'Error tracking activity', error: error.message });
    }
};

// Get collaboration statistics
const getCollaborationStats = async (req, res) => {
    try {
        const { id } = req.params;
        
        const collaboration = await Collaboration.findById(id)
            .populate('collaborators.user', 'username profile.displayName profile.avatar');
        
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }
        
        // Calculate advanced statistics
        const stats = {
            basic: {
                totalVersions: collaboration.versions.length,
                totalComments: collaboration.comments.length,
                totalContributors: collaboration.collaborators.length + 1, // +1 for owner
                totalViews: collaboration.stats.totalViews,
                totalForks: collaboration.stats.totalForks
            },
            activity: {
                lastActivity: collaboration.updatedAt,
                averageVersionsPerCollaborator: collaboration.versions.length / (collaboration.collaborators.length + 1),
                commentsPerVersion: collaboration.comments.length / Math.max(collaboration.versions.length, 1),
                activityScore: collaboration.collaborators.reduce((sum, c) => sum + c.contributionScore, 0)
            },
            contributors: collaboration.collaborators.map(collab => ({
                user: collab.user,
                role: collab.role,
                joinedAt: collab.joinedAt,
                lastActive: collab.lastActive,
                contributionScore: collab.contributionScore,
                versionsCreated: collaboration.versions.filter(v => 
                    v.createdBy.toString() === collab.user._id.toString()
                ).length,
                commentsAdded: collaboration.comments.filter(c => 
                    c.user.toString() === collab.user._id.toString()
                ).length
            })),
            timeline: {
                createdAt: collaboration.createdAt,
                daysSinceCreation: Math.floor((Date.now() - collaboration.createdAt) / (1000 * 60 * 60 * 24)),
                isRecentlyActive: (Date.now() - collaboration.updatedAt) < 300000, // Active in last 5 minutes
                growthRate: collaboration.collaborators.length / Math.max(Math.floor((Date.now() - collaboration.createdAt) / (1000 * 60 * 60 * 24)), 1)
            }
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting collaboration stats:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

module.exports = {
    getCollaborationActivity,
    trackUserActivity,
    getCollaborationStats
};
