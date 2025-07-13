// 👥 Follow Model (MVC - Model Layer)
// This defines the structure for user following relationships

const mongoose = require('mongoose');

// Define the Follow schema
const followSchema = new mongoose.Schema({
    // User who is following
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Follower is required']
    },
    
    // User being followed
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Following user is required']
    },
    
    // When the follow relationship was created
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Optional: Follow status (for potential unfollow/refollow tracking)
    status: {
        type: String,
        enum: ['active', 'unfollowed'],
        default: 'active'
    },
    
    // Optional: Notification preferences for this follow
    notifications: {
        newMemes: {
            type: Boolean,
            default: true
        },
        achievements: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Compound index to ensure unique follower-following pairs
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for faster queries
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });
followSchema.index({ createdAt: -1 });

// Static methods
followSchema.statics.getFollowersCount = async function(userId) {
    return await this.countDocuments({ following: userId, status: 'active' });
};

followSchema.statics.getFollowingCount = async function(userId) {
    return await this.countDocuments({ follower: userId, status: 'active' });
};

followSchema.statics.isFollowing = async function(followerId, followingId) {
    const follow = await this.findOne({ 
        follower: followerId, 
        following: followingId,
        status: 'active'
    });
    return !!follow;
};

followSchema.statics.getFollowers = async function(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    return await this.find({ following: userId, status: 'active' })
        .populate('follower', 'username email avatar stats.totalMemes stats.totalLikes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

followSchema.statics.getFollowing = async function(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    return await this.find({ follower: userId, status: 'active' })
        .populate('following', 'username email avatar stats.totalMemes stats.totalLikes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

// Instance methods
followSchema.methods.unfollow = async function() {
    this.status = 'unfollowed';
    return await this.save();
};

followSchema.methods.refollow = async function() {
    this.status = 'active';
    return await this.save();
};

// Pre-save middleware to prevent self-following
followSchema.pre('save', function(next) {
    if (this.follower.toString() === this.following.toString()) {
        return next(new Error('Users cannot follow themselves'));
    }
    next();
});

// Export the Follow model
module.exports = mongoose.model('Follow', followSchema);
