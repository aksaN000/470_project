const mongoose = require('mongoose');

const memeTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'reaction', 'mocking', 'success', 'fail', 'advice',
            'rage', 'philosoraptor', 'first_world_problems', 
            'conspiracy', 'confession', 'socially_awkward',
            'good_guy', 'scumbag', 'popular', 'classic'
        ],
        default: 'popular'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Text areas configuration for the template
    textAreas: [{
        id: {
            type: String,
            required: true
        },
        x: {
            type: Number,
            required: true,
            min: 0,
            max: 100 // Percentage
        },
        y: {
            type: Number,
            required: true,
            min: 0,
            max: 100 // Percentage
        },
        width: {
            type: Number,
            required: true,
            min: 1,
            max: 100 // Percentage
        },
        height: {
            type: Number,
            required: true,
            min: 1,
            max: 100 // Percentage
        },
        defaultText: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Enter text here'
        },
        fontSize: {
            type: Number,
            default: 24,
            min: 8,
            max: 72
        },
        fontFamily: {
            type: String,
            default: 'Impact',
            enum: ['Impact', 'Arial', 'Helvetica', 'Times New Roman', 'Comic Sans MS']
        },
        fontColor: {
            type: String,
            default: '#FFFFFF'
        },
        strokeColor: {
            type: String,
            default: '#000000'
        },
        strokeWidth: {
            type: Number,
            default: 2,
            min: 0,
            max: 10
        },
        textAlign: {
            type: String,
            default: 'center',
            enum: ['left', 'center', 'right']
        },
        verticalAlign: {
            type: String,
            default: 'middle',
            enum: ['top', 'middle', 'bottom']
        }
    }],
    // Template creator and status
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isOfficial: {
        type: Boolean,
        default: false // Set by admins for verified templates
    },
    // Usage statistics
    stats: {
        usageCount: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        ratingCount: {
            type: Number,
            default: 0
        },
        lastUsed: {
            type: Date
        }
    },
    // Individual ratings from users
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Template metrics
    favoriteCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    usageCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    // Template state
    isActive: {
        type: Boolean,
        default: true
    },
    // Dimensions for proper scaling
    dimensions: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        }
    },
    // Source information
    source: {
        name: {
            type: String,
            default: ''
        },
        url: {
            type: String,
            default: ''
        },
        license: {
            type: String,
            default: 'fair_use',
            enum: ['fair_use', 'creative_commons', 'public_domain', 'custom']
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
memeTemplateSchema.index({ category: 1, isPublic: 1 });
memeTemplateSchema.index({ 'stats.usageCount': -1 });
memeTemplateSchema.index({ 'stats.rating': -1 });
memeTemplateSchema.index({ createdBy: 1 });
memeTemplateSchema.index({ tags: 1 });

// Method to increment usage count
memeTemplateSchema.methods.incrementUsage = function() {
    this.stats.usageCount += 1;
    this.stats.lastUsed = new Date();
    return this.save();
};

// Method to add rating
memeTemplateSchema.methods.addRating = function(rating) {
    const totalRating = (this.stats.rating * this.stats.ratingCount) + rating;
    this.stats.ratingCount += 1;
    this.stats.rating = totalRating / this.stats.ratingCount;
    return this.save();
};

// Static method to find popular templates
memeTemplateSchema.statics.findPopular = function(limit = 10) {
    return this.find({ isPublic: true })
        .sort({ 'stats.usageCount': -1, 'stats.rating': -1 })
        .limit(limit)
        .populate('createdBy', 'username profile.displayName')
        .lean();
};

// Static method to find templates by category
memeTemplateSchema.statics.findByCategory = function(category, options = {}) {
    const {
        page = 1,
        limit = 20,
        sortBy = 'stats.usageCount',
        sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    return this.find({ category, isPublic: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username profile.displayName')
        .lean();
};

// Static method to search templates
memeTemplateSchema.statics.searchTemplates = function(query, options = {}) {
    const {
        page = 1,
        limit = 20,
        category = null
    } = options;

    const skip = (page - 1) * limit;
    
    const searchCriteria = {
        isPublic: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };

    if (category) {
        searchCriteria.category = category;
    }

    return this.find(searchCriteria)
        .sort({ 'stats.usageCount': -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username profile.displayName')
        .lean();
};

// Virtual for template URL
memeTemplateSchema.virtual('url').get(function() {
    return `/templates/${this._id}`;
});

// Ensure virtuals are included in JSON output
memeTemplateSchema.set('toJSON', { virtuals: true });
memeTemplateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MemeTemplate', memeTemplateSchema);
