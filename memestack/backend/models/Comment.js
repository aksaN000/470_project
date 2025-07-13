// 💬 Comment Model (MVC - Model Layer)
// Database schema for meme comments

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // Content
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    
    // References
    meme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
        required: [true, 'Meme reference is required']
    },
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    
    // Parent comment for replies
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    
    // Social interactions
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Statistics
    stats: {
        likesCount: {
            type: Number,
            default: 0
        },
        repliesCount: {
            type: Number,
            default: 0
        }
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Moderation
    isReported: {
        type: Boolean,
        default: false
    },
    
    reports: [{
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'other']
        },
        description: String,
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }]
    
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// ========================================
// INDEXES
// ========================================
commentSchema.index({ meme: 1, createdAt: -1 }); // Comments by meme, newest first
commentSchema.index({ author: 1, createdAt: -1 }); // Comments by author
commentSchema.index({ parentComment: 1 }); // Replies to comments
commentSchema.index({ 'stats.likesCount': -1 }); // Most liked comments

// ========================================
// VIRTUAL FIELDS
// ========================================

// Check if user has liked this comment
commentSchema.virtual('isLikedBy').get(function() {
    return function(userId) {
        if (!userId) return false;
        return this.likes.some(like => like.user.toString() === userId.toString());
    };
});

// ========================================
// MIDDLEWARE
// ========================================

// Update stats when comment is saved
commentSchema.pre('save', function(next) {
    this.stats.likesCount = this.likes.length;
    next();
});

// Populate author info when finding comments
commentSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'author',
        select: 'username profile.avatar'
    });
    next();
});

// ========================================
// INSTANCE METHODS
// ========================================

// Add like to comment
commentSchema.methods.addLike = function(userId) {
    const alreadyLiked = this.likes.some(like => 
        like.user.toString() === userId.toString()
    );
    
    if (!alreadyLiked) {
        this.likes.push({ user: userId });
        this.stats.likesCount = this.likes.length;
    }
    
    return this.save();
};

// Remove like from comment
commentSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => 
        like.user.toString() !== userId.toString()
    );
    this.stats.likesCount = this.likes.length;
    
    return this.save();
};

// Get public comment data
commentSchema.methods.getPublicData = function() {
    return {
        id: this._id,
        content: this.content,
        meme: this.meme,
        author: this.author,
        parentComment: this.parentComment,
        stats: this.stats,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// ========================================
// STATIC METHODS
// ========================================

// Get comments for a meme
commentSchema.statics.getCommentsByMeme = function(memeId, options = {}) {
    const { limit = 20, skip = 0, sortBy = 'createdAt', sortOrder = -1 } = options;
    
    let sortObj = {};
    sortObj[sortBy] = sortOrder;
    
    return this.find({
        meme: memeId,
        isActive: true,
        parentComment: null // Only top-level comments
    })
    .sort(sortObj)
    .limit(limit)
    .skip(skip);
};

// Get replies to a comment
commentSchema.statics.getReplies = function(commentId, options = {}) {
    const { limit = 10, skip = 0 } = options;
    
    return this.find({
        parentComment: commentId,
        isActive: true
    })
    .sort({ createdAt: 1 }) // Oldest first for replies
    .limit(limit)
    .skip(skip);
};

// Get user's comments
commentSchema.statics.getUserComments = function(userId, options = {}) {
    const { limit = 20, skip = 0 } = options;
    
    return this.find({
        author: userId,
        isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Create and export the model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
