const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200,
        default: ''
    },
    color: {
        type: String,
        default: '#6366f1', // Default indigo color
        match: /^#[0-9A-F]{6}$/i // Hex color validation
    },
    icon: {
        type: String,
        default: 'folder',
        enum: [
            'folder', 'star', 'heart', 'bookmark', 'tag',
            'image', 'trending_up', 'favorite', 'public',
            'work', 'school', 'home', 'sports', 'music'
        ]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: true
    },
    memes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme'
    }],
    memeCount: {
        type: Number,
        default: 0
    },
    // Stats for the folder
    stats: {
        totalViews: {
            type: Number,
            default: 0
        },
        totalLikes: {
            type: Number,
            default: 0
        },
        totalDownloads: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    // Sharing settings
    sharing: {
        isPublic: {
            type: Boolean,
            default: false
        },
        shareToken: {
            type: String,
            unique: true,
            sparse: true // Allows null values while maintaining uniqueness
        },
        allowDownload: {
            type: Boolean,
            default: true
        },
        allowComments: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
folderSchema.index({ owner: 1, name: 1 });
folderSchema.index({ owner: 1, createdAt: -1 });
folderSchema.index({ 'sharing.shareToken': 1 });

// Pre-save middleware to update stats
folderSchema.pre('save', function(next) {
    if (this.memes && this.memes.length !== this.memeCount) {
        this.memeCount = this.memes.length;
        this.stats.lastUpdated = new Date();
    }
    next();
});

// Method to add meme to folder
folderSchema.methods.addMeme = function(memeId) {
    if (!this.memes.includes(memeId)) {
        this.memes.push(memeId);
        this.memeCount = this.memes.length;
        this.stats.lastUpdated = new Date();
    }
    return this.save();
};

// Method to remove meme from folder
folderSchema.methods.removeMeme = function(memeId) {
    this.memes = this.memes.filter(id => !id.equals(memeId));
    this.memeCount = this.memes.length;
    this.stats.lastUpdated = new Date();
    return this.save();
};

// Method to generate share token
folderSchema.methods.generateShareToken = function() {
    const crypto = require('crypto');
    this.sharing.shareToken = crypto.randomBytes(16).toString('hex');
    this.sharing.isPublic = true;
    return this.save();
};

// Static method to find user's folders
folderSchema.statics.findUserFolders = function(userId, options = {}) {
    const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    return this.find({ owner: userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('memes', 'title imageUrl category createdAt stats')
        .lean();
};

// Virtual for folder URL
folderSchema.virtual('url').get(function() {
    return `/folders/${this._id}`;
});

// Virtual for public share URL
folderSchema.virtual('shareUrl').get(function() {
    if (this.sharing.shareToken) {
        return `/shared/folders/${this.sharing.shareToken}`;
    }
    return null;
});

// Ensure virtuals are included in JSON output
folderSchema.set('toJSON', { virtuals: true });
folderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Folder', folderSchema);
