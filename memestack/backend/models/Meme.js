// 🖼️ Meme Model (MVC - Model Layer)
// This defines the structure of meme data in our database

const mongoose = require('mongoose');

// Define the Meme schema
const memeSchema = new mongoose.Schema({
    // Basic meme information
    title: {
        type: String,
        required: [true, 'Meme title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    
    // File information
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    
    thumbnailUrl: {
        type: String,
        default: ''
    },
    
    // Enhanced image metadata
    imageData: {
        fileId: {
            type: String,
            default: ''
        },
        originalName: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 0
        },
        width: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        format: {
            type: String,
            default: ''
        },
        urls: {
            original: {
                type: String,
                default: ''
            },
            optimized: {
                type: String,
                default: ''
            },
            thumbnail: {
                type: String,
                default: ''
            }
        }
    },
    
    // Creator information
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    
    // Content categorization
    category: {
        type: String,
        enum: ['funny', 'reaction', 'gaming', 'sports', 'political', 'wholesome', 'dark', 'trending', 'custom'],
        default: 'funny'
    },
    
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    
    // Privacy and visibility
    isPublic: {
        type: Boolean,
        default: true
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Social interaction
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
        views: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        downloads: {
            type: Number,
            default: 0
        },
        likesCount: {
            type: Number,
            default: 0
        },
        commentsCount: {
            type: Number,
            default: 0
        }
    },
    
    // File metadata
    metadata: {
        originalFilename: String,
        fileSize: Number,
        mimeType: String,
        dimensions: {
            width: Number,
            height: Number
        },
        format: {
            type: String,
            enum: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            default: 'jpg'
        }
    },
    
    // Collaboration features
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    
    collaboration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collaboration',
        default: null
    },
    
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        default: null
    },
    
    // Original meme reference (for remixes)
    originalMeme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
        default: null
    },
    
    remixType: {
        type: String,
        enum: ['reaction', 'response', 'continuation', 'parody', 'mashup', 'template_variation'],
        default: null
    },
    
    // Meme creation details (for generated memes)
    memeData: {
        templateId: String,
        textElements: [{
            text: String,
            position: {
                x: Number,
                y: Number
            },
            style: {
                fontSize: Number,
                fontFamily: String,
                color: String,
                bold: Boolean,
                italic: Boolean
            }
        }]
    }
    
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            // Add virtual fields to JSON output
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// ========================================
// INDEXES for better performance
// ========================================
memeSchema.index({ creator: 1, createdAt: -1 }); // User's memes by date
memeSchema.index({ category: 1, isPublic: 1 }); // Public memes by category
memeSchema.index({ tags: 1, isPublic: 1 }); // Search by tags
memeSchema.index({ 'stats.likesCount': -1, isPublic: 1 }); // Most liked memes
memeSchema.index({ 'stats.views': -1, isPublic: 1 }); // Most viewed memes
memeSchema.index({ createdAt: -1, isPublic: 1 }); // Recent memes
memeSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search

// ========================================
// VIRTUAL FIELDS
// ========================================

// Check if user has liked this meme
memeSchema.virtual('isLikedBy').get(function() {
    const self = this;
    return function(userId) {
        if (!userId) return false;
        return self.likes.some(like => like.user.toString() === userId.toString());
    };
});

// Get formatted creation date
memeSchema.virtual('createdAtFormatted').get(function() {
    return this.createdAt.toLocaleDateString();
});

// ========================================
// MIDDLEWARE
// ========================================

// Update stats when meme is saved
memeSchema.pre('save', function(next) {
    // Update likes count
    this.stats.likesCount = this.likes.length;
    
    if (this.isNew) {
        console.log(`🎭 New meme created: "${this.title}" by ${this.creator}`);
    }
    
    next();
});

// Populate creator info when finding memes
memeSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'creator',
        select: 'username profile.avatar stats.memesCreated'
    });
    next();
});

// ========================================
// INSTANCE METHODS
// ========================================

// Add like to meme
memeSchema.methods.addLike = function(userId) {
    // Check if already liked
    const alreadyLiked = this.likes.some(like => 
        like.user.toString() === userId.toString()
    );
    
    if (!alreadyLiked) {
        this.likes.push({ user: userId });
        this.stats.likesCount = this.likes.length;
    }
    
    return this.save();
};

// Remove like from meme
memeSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => 
        like.user.toString() !== userId.toString()
    );
    this.stats.likesCount = this.likes.length;
    
    return this.save();
};

// Increment view count
memeSchema.methods.incrementViews = function() {
    this.stats.views += 1;
    return this.save();
};

// Increment share count
memeSchema.methods.incrementShares = function() {
    this.stats.shares += 1;
    return this.save();
};

// Increment download count
memeSchema.methods.incrementDownloads = function() {
    this.stats.downloads += 1;
    return this.save();
};

// Get public meme data (for API responses)
memeSchema.methods.getPublicData = function(userId = null) {
    const publicData = {
        id: this._id,
        title: this.title,
        description: this.description,
        imageUrl: this.imageUrl,
        thumbnailUrl: this.thumbnailUrl,
        creator: this.creator,
        category: this.category,
        tags: this.tags,
        stats: this.stats,
        createdAt: this.createdAt,
        metadata: {
            format: this.metadata.format,
            dimensions: this.metadata.dimensions
        }
    };
    
    // Add like status if user is provided
    if (userId) {
        publicData.isLiked = this.isLikedBy(userId);
    }
    
    return publicData;
};

// ========================================
// STATIC METHODS
// ========================================

// Get trending memes (most liked in last 7 days)
memeSchema.statics.getTrending = function(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return this.find({
        isPublic: true,
        isActive: true,
        createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ 'stats.likesCount': -1, 'stats.views': -1 })
    .limit(limit);
};

// Get memes by category
memeSchema.statics.getByCategory = function(category, limit = 20, skip = 0) {
    return this.find({
        category,
        isPublic: true,
        isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Search memes
memeSchema.statics.searchMemes = function(query, options = {}) {
    const {
        category,
        tags,
        limit = 20,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = -1
    } = options;
    
    let searchQuery = {
        isPublic: true,
        isActive: true
    };
    
    // Text search
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    // Category filter
    if (category && category !== 'all') {
        searchQuery.category = category;
    }
    
    // Tags filter
    if (tags && tags.length > 0) {
        searchQuery.tags = { $in: tags };
    }
    
    let sortObj = {};
    sortObj[sortBy] = sortOrder;
    
    return this.find(searchQuery)
        .sort(sortObj)
        .limit(limit)
        .skip(skip);
};

// Get user's memes
memeSchema.statics.getUserMemes = function(userId, includePrivate = false) {
    let query = { creator: userId };
    
    if (!includePrivate) {
        query.isPublic = true;
    }
    
    query.isActive = true;
    
    return this.find(query).sort({ createdAt: -1 });
};

// Create and export the model
const Meme = mongoose.model('Meme', memeSchema);

module.exports = Meme;
