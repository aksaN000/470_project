// 👤 User Model (MVC - Model Layer)
// This defines the structure of user data in our database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    // Basic user information
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores']
    },
    
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        // Don't return password in queries by default
        select: false
    },
    
    // User profile information
    profile: {
        displayName: {
            type: String,
            maxlength: [50, 'Display name cannot exceed 50 characters'],
            default: ''
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        joinDate: {
            type: Date,
            default: Date.now
        }
    },
    
    // User statistics
    stats: {
        memesCreated: {
            type: Number,
            default: 0
        },
        totalLikes: {
            type: Number,
            default: 0
        },
        totalShares: {
            type: Number,
            default: 0
        },
        totalViews: {
            type: Number,
            default: 0
        }
    },
    
    // User preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
            default: 'en'
        },
        dataUsage: {
            type: String,
            enum: ['low', 'standard', 'high'],
            default: 'standard'
        }
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    // Moderation information
    moderation: {
        isBanned: {
            type: Boolean,
            default: false
        },
        banReason: {
            type: String,
            default: ''
        },
        banDate: {
            type: Date
        },
        isSuspended: {
            type: Boolean,
            default: false
        },
        suspensionEnd: {
            type: Date
        },
        suspensionReason: {
            type: String,
            default: ''
        },
        warningCount: {
            type: Number,
            default: 0
        },
        warnings: [{
            reason: String,
            date: {
                type: Date,
                default: Date.now
            },
            reportId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Report'
            }
        }],
        lastViolation: {
            type: Date
        }
    }
    
}, {
    // Add timestamps (createdAt, updatedAt)
    timestamps: true,
    
    // Transform output (remove sensitive data)
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// ========================================
// MIDDLEWARE (runs before saving)
// ========================================

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's new or modified
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update stats when user is saved
userSchema.pre('save', function(next) {
    if (this.isNew) {
        console.log(`🎉 New user created: ${this.username}`);
    }
    next();
});

// ========================================
// INSTANCE METHODS
// ========================================

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Compare provided password with hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Get user's public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
    return {
        _id: this._id,
        username: this.username,
        profile: this.profile,
        stats: this.stats,
        joinDate: this.createdAt
    };
};

// Update user statistics
userSchema.methods.updateStats = function(field, increment = 1) {
    if (this.stats[field] !== undefined) {
        this.stats[field] += increment;
        return this.save();
    }
    throw new Error(`Invalid stats field: ${field}`);
};

// ========================================
// STATIC METHODS
// ========================================

// Find user by email or username
userSchema.statics.findByCredentials = async function(identifier) {
    const user = await this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
        ]
    }).select('+password');
    
    return user;
};

// Get user statistics
userSchema.statics.getUserStats = async function(userId) {
    const user = await this.findById(userId).select('stats');
    return user ? user.stats : null;
};

// ========================================
// INDEXES for better performance
// ========================================

// Compound index for faster searches
userSchema.index({ username: 1, email: 1 });
userSchema.index({ 'stats.memesCreated': -1 }); // For top creators
userSchema.index({ createdAt: -1 }); // For recent users

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
