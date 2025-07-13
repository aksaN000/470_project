// 👥 Group Model
// Defines the schema for community groups and collaborative spaces

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    longDescription: {
        type: String,
        maxlength: 2000
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: [
            'general', 'gaming', 'sports', 'politics', 'entertainment',
            'technology', 'science', 'art', 'music', 'education',
            'business', 'lifestyle', 'food', 'travel', 'fashion',
            'dank', 'wholesome', 'dark_humor', 'nsfw', 'regional'
        ],
        default: 'general'
    },
    avatar: {
        type: String,
        default: null
    },
    banner: {
        type: String,
        default: null
    },
    privacy: {
        type: String,
        enum: ['public', 'private', 'invite_only'],
        default: 'public'
    },
    visibility: {
        type: String,
        enum: ['listed', 'unlisted', 'hidden'],
        default: 'listed'
    },
    membershipType: {
        type: String,
        enum: ['open', 'approval_required', 'invite_only'],
        default: 'open'
    },
    rules: [{
        title: {
            type: String,
            required: true,
            maxlength: 100
        },
        description: {
            type: String,
            maxlength: 300
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    settings: {
        allowMemeUploads: {
            type: Boolean,
            default: true
        },
        allowChallenges: {
            type: Boolean,
            default: true
        },
        allowPolls: {
            type: Boolean,
            default: true
        },
        allowCollaborations: {
            type: Boolean,
            default: true
        },
        requirePostApproval: {
            type: Boolean,
            default: false
        },
        minAccountAge: {
            type: Number,
            default: 0 // days
        },
        minKarma: {
            type: Number,
            default: 0
        },
        postCooldown: {
            type: Number,
            default: 0 // minutes
        }
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['member', 'moderator', 'admin', 'owner'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        permissions: [{
            type: String,
            enum: [
                'manage_posts', 'manage_members', 'manage_settings',
                'ban_members', 'delete_posts', 'pin_posts',
                'create_challenges', 'manage_challenges'
            ]
        }],
        stats: {
            postsCount: {
                type: Number,
                default: 0
            },
            contributionScore: {
                type: Number,
                default: 0
            }
        }
    }],
    pendingMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        message: {
            type: String,
            maxlength: 300
        }
    }],
    bannedMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        bannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        bannedAt: {
            type: Date,
            default: Date.now
        },
        reason: {
            type: String,
            maxlength: 300
        },
        expiresAt: {
            type: Date,
            default: null // null means permanent
        }
    }],
    featured: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    stats: {
        memberCount: {
            type: Number,
            default: 1
        },
        postCount: {
            type: Number,
            default: 0
        },
        challengeCount: {
            type: Number,
            default: 0
        },
        totalViews: {
            type: Number,
            default: 0
        },
        weeklyActiveMembers: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    socialLinks: {
        website: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/.+/.test(v);
                },
                message: 'Invalid website URL'
            }
        },
        discord: String,
        twitter: String,
        instagram: String,
        youtube: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
groupSchema.index({ slug: 1 });
groupSchema.index({ category: 1, privacy: 1 });
groupSchema.index({ featured: 1, 'stats.memberCount': -1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug
groupSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

// Virtual for getting member count
groupSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Virtual for checking if user is member
groupSchema.virtual('isMember').get(function() {
    return function(userId) {
        return this.members.some(member => 
            member.user.toString() === userId.toString()
        );
    }.bind(this);
});

// Virtual for getting user role
groupSchema.virtual('getUserRole').get(function() {
    return function(userId) {
        const member = this.members.find(member => 
            member.user.toString() === userId.toString()
        );
        return member ? member.role : null;
    }.bind(this);
});

// Instance method to add member
groupSchema.methods.addMember = function(userId, role = 'member') {
    if (this.isMember(userId)) {
        throw new Error('User is already a member');
    }
    
    this.members.push({ user: userId, role });
    this.stats.memberCount = this.members.length;
    return this.save();
};

// Instance method to remove member
groupSchema.methods.removeMember = function(userId) {
    const memberIndex = this.members.findIndex(member => 
        member.user.toString() === userId.toString()
    );
    
    if (memberIndex === -1) {
        throw new Error('User is not a member');
    }
    
    // Prevent removing the owner
    if (this.members[memberIndex].role === 'owner') {
        throw new Error('Cannot remove group owner');
    }
    
    this.members.splice(memberIndex, 1);
    this.stats.memberCount = this.members.length;
    return this.save();
};

// Instance method to update member role
groupSchema.methods.updateMemberRole = function(userId, newRole, updatedBy) {
    const member = this.members.find(member => 
        member.user.toString() === userId.toString()
    );
    
    if (!member) {
        throw new Error('User is not a member');
    }
    
    // Prevent changing owner role
    if (member.role === 'owner' || newRole === 'owner') {
        throw new Error('Cannot change owner role');
    }
    
    member.role = newRole;
    return this.save();
};

// Instance method to ban member
groupSchema.methods.banMember = function(userId, bannedBy, reason, expiresAt = null) {
    // Remove from members if exists
    this.removeMember(userId);
    
    // Add to banned list
    this.bannedMembers.push({
        user: userId,
        bannedBy,
        reason,
        expiresAt
    });
    
    return this.save();
};

// Static method to get trending groups
groupSchema.statics.getTrending = function() {
    return this.find({
        privacy: 'public',
        visibility: 'listed'
    })
    .sort({ 'stats.weeklyActiveMembers': -1, 'stats.memberCount': -1 })
    .limit(12)
    .populate('creator', 'username profile.displayName profile.avatar');
};

// Static method to search groups
groupSchema.statics.searchGroups = function(query, category = null) {
    const searchQuery = {
        privacy: 'public',
        visibility: 'listed',
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };
    
    if (category) {
        searchQuery.category = category;
    }
    
    return this.find(searchQuery)
        .sort({ 'stats.memberCount': -1 })
        .populate('creator', 'username profile.displayName profile.avatar');
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
