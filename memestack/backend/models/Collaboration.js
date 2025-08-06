// 🤝 Collaboration Model
// Defines the schema for meme remixes and collaborative editing

const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['remix', 'collaboration', 'template_creation', 'challenge_response'],
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'reviewing', 'completed', 'cancelled'],
        default: 'draft'
    },
    originalMeme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
        default: null
    },
    parentCollaboration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collaboration',
        default: null
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        default: null
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['contributor', 'editor', 'reviewer', 'admin'],
            default: 'contributor'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        permissions: [{
            type: String,
            enum: [
                'edit_content', 'add_elements', 'manage_versions',
                'invite_others', 'approve_changes', 'publish'
            ]
        }],
        contributionScore: {
            type: Number,
            default: 0
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    }],
    pendingInvites: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        invitedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['contributor', 'editor', 'reviewer'],
            default: 'contributor'
        },
        message: {
            type: String,
            maxlength: 300
        },
        expiresAt: {
            type: Date,
            default: function() {
                return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            }
        }
    }],
    versions: [{
        version: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            maxlength: 500
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        meme: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meme',
            required: true
        },
        changes: [{
            type: {
                type: String,
                enum: ['text_edit', 'image_edit', 'element_add', 'element_remove', 'style_change'],
                required: true
            },
            description: {
                type: String,
                required: true
            },
            previousValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        approved: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        approvedAt: {
            type: Date,
            default: null
        },
        isCurrent: {
            type: Boolean,
            default: false
        }
    }],
    finalMeme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
        default: null
    },
    settings: {
        isPublic: {
            type: Boolean,
            default: true
        },
        allowForks: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        },
        maxCollaborators: {
            type: Number,
            min: 2,
            max: 50,
            default: 10
        },
        deadline: {
            type: Date,
            default: null
        },
        allowAnonymous: {
            type: Boolean,
            default: false
        }
    },
    remixInfo: {
        remixType: {
            type: String,
            enum: ['reaction', 'response', 'continuation', 'parody', 'mashup', 'template_variation'],
            default: null
        },
        originalCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        remixChain: [{
            meme: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meme'
            },
            collaboration: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Collaboration'
            }
        }],
        attribution: {
            type: String,
            maxlength: 200
        }
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        versionNumber: {
            type: Number,
            default: null
        },
        elementId: {
            type: String,
            default: null
        },
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true,
                maxlength: 300
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    stats: {
        totalVersions: {
            type: Number,
            default: 0
        },
        totalContributors: {
            type: Number,
            default: 1
        },
        totalViews: {
            type: Number,
            default: 0
        },
        totalLikes: {
            type: Number,
            default: 0
        },
        totalForks: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
collaborationSchema.index({ owner: 1, status: 1 });
collaborationSchema.index({ 'collaborators.user': 1 });
collaborationSchema.index({ originalMeme: 1 });
collaborationSchema.index({ type: 1, status: 1 });
collaborationSchema.index({ challenge: 1 });
collaborationSchema.index({ group: 1 });
collaborationSchema.index({ createdAt: -1 });

// Virtual for getting current version
collaborationSchema.virtual('currentVersion').get(function() {
    if (!this.versions || this.versions.length === 0) {
        return null;
    }
    return this.versions.find(v => v.isCurrent) || this.versions[this.versions.length - 1];
});

// Instance method to check if user is collaborator
collaborationSchema.methods.isCollaborator = function(userId) {
    // Owner is always considered a collaborator
    if (this.owner.toString() === userId.toString()) {
        return true;
    }
    
    // Check if user is in collaborators list
    return this.collaborators.some(collab => 
        collab.user.toString() === userId.toString()
    );
};

// Instance method to check if user is owner
collaborationSchema.methods.isOwner = function(userId) {
    return this.owner.toString() === userId.toString();
};

// Instance method to get user role
collaborationSchema.methods.getUserRole = function(userId) {
    if (this.isOwner(userId)) return 'owner';
    
    const collaborator = this.collaborators.find(collab => 
        collab.user.toString() === userId.toString()
    );
    
    return collaborator ? collaborator.role : null;
};

// Instance method to check if user can edit
collaborationSchema.methods.canUserEdit = function(userId) {
    const role = this.getUserRole(userId);
    return ['owner', 'admin', 'editor'].includes(role);
};

// Instance method to check if user can create versions
collaborationSchema.methods.canUserCreateVersions = function(userId) {
    const role = this.getUserRole(userId);
    return ['owner', 'admin', 'editor', 'contributor'].includes(role);
};

// Instance method to check if user can invite others
collaborationSchema.methods.canUserInvite = function(userId) {
    const role = this.getUserRole(userId);
    return ['owner', 'admin', 'editor'].includes(role);
};

// Instance method to add collaborator
collaborationSchema.methods.addCollaborator = function(userId, role = 'contributor', permissions = []) {
    if (this.isCollaborator(userId)) {
        throw new Error('User is already a collaborator');
    }
    
    if (this.collaborators.length >= this.settings.maxCollaborators) {
        throw new Error('Maximum collaborators reached');
    }
    
    this.collaborators.push({ 
        user: userId, 
        role, 
        permissions 
    });
    this.stats.totalContributors = this.collaborators.length + 1; // +1 for owner
    return this.save();
};

// Instance method to remove collaborator
collaborationSchema.methods.removeCollaborator = function(userId) {
    const initialLength = this.collaborators.length;
    this.collaborators = this.collaborators.filter(collab => 
        collab.user.toString() !== userId.toString()
    );
    
    if (this.collaborators.length === initialLength) {
        throw new Error('User is not a collaborator');
    }
    
    this.stats.totalContributors = this.collaborators.length + 1; // +1 for owner
    return this.save();
};

// Instance method to update collaborator role
collaborationSchema.methods.updateCollaboratorRole = function(userId, newRole) {
    const collaborator = this.collaborators.find(collab => 
        collab.user.toString() === userId.toString()
    );
    
    if (!collaborator) {
        throw new Error('User is not a collaborator');
    }
    
    collaborator.role = newRole;
    return this.save();
};

// Instance method to accept invite
collaborationSchema.methods.acceptInvite = function(userId) {
    const inviteIndex = this.pendingInvites.findIndex(invite => 
        invite.user.toString() === userId.toString()
    );
    
    if (inviteIndex === -1) {
        throw new Error('No pending invite found');
    }
    
    const invite = this.pendingInvites[inviteIndex];
    this.pendingInvites.splice(inviteIndex, 1);
    
    return this.addCollaborator(userId, invite.role);
};

// Instance method to decline invite
collaborationSchema.methods.declineInvite = function(userId) {
    const inviteIndex = this.pendingInvites.findIndex(invite => 
        invite.user.toString() === userId.toString()
    );
    
    if (inviteIndex === -1) {
        throw new Error('No pending invite found');
    }
    
    this.pendingInvites.splice(inviteIndex, 1);
    return this.save();
};

// Instance method to add comment
collaborationSchema.methods.addComment = function(userId, content, versionNumber = null, elementId = null) {
    const comment = {
        user: userId,
        content,
        versionNumber,
        elementId,
        createdAt: new Date()
    };
    
    this.comments.push(comment);
    this.stats.totalComments = this.comments.length;
    return this.save();
};

// Instance method to invite user
collaborationSchema.methods.inviteUser = function(userId, invitedBy, role = 'contributor', message = '') {
    // Check if already invited
    const existingInvite = this.pendingInvites.find(invite => 
        invite.user.toString() === userId.toString()
    );
    
    if (existingInvite) {
        throw new Error('User already has a pending invite');
    }
    
    if (this.isCollaborator(userId)) {
        throw new Error('User is already a collaborator');
    }
    
    this.pendingInvites.push({
        user: userId,
        invitedBy,
        role,
        message
    });
    
    return this.save();
};

// Instance method to create new version
collaborationSchema.methods.createVersion = function(createdBy, title, memeId, changes = [], description = '') {
    const versionNumber = this.versions.length + 1;
    
    // Mark previous version as not current
    this.versions.forEach(v => v.isCurrent = false);
    
    const newVersion = {
        version: versionNumber,
        title,
        description,
        createdBy,
        meme: memeId,
        changes,
        isCurrent: true,
        approved: !this.settings.requireApproval
    };
    
    this.versions.push(newVersion);
    this.stats.totalVersions = this.versions.length;
    
    return this.save();
};

// Instance method to fork collaboration
collaborationSchema.methods.fork = function(newOwner, title) {
    if (!this.settings.allowForks) {
        throw new Error('Forking is not allowed for this collaboration');
    }
    
    const Collaboration = this.constructor;
    
    return new Collaboration({
        title: title || `Fork of ${this.title}`,
        description: `Forked from: ${this.title}`,
        type: this.type,
        owner: newOwner,
        parentCollaboration: this._id,
        originalMeme: this.originalMeme,
        challenge: this.challenge,
        group: this.group,
        status: 'active',
        settings: {
            ...this.settings,
            maxCollaborators: Math.min(this.settings.maxCollaborators, 10)
        },
        remixInfo: {
            ...this.remixInfo
        },
        tags: [...(this.tags || [])],
        collaborators: [],
        pendingInvites: [],
        versions: [],
        comments: [],
        stats: {
            totalContributors: 1,
            totalViews: 0,
            totalForks: 0,
            totalVersions: 0,
            totalLikes: 0,
            totalComments: 0,
            completionRate: 0
        }
    });
};

// Static method to get trending collaborations
collaborationSchema.statics.getTrending = function() {
    return this.find({
        status: { $in: ['active', 'reviewing'] },
        'settings.isPublic': true
    })
    .sort({ 'stats.totalContributors': -1, 'stats.totalViews': -1 })
    .limit(10)
    .populate('owner', 'username profile.displayName profile.avatar')
    .populate('originalMeme', 'title imageUrl')
    .populate('finalMeme', 'title imageUrl');
};

// Static method to get user collaborations
collaborationSchema.statics.getUserCollaborations = function(userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'collaborators.user': userId }
        ]
    })
    .sort({ updatedAt: -1 })
    .populate('owner', 'username profile.displayName profile.avatar')
    .populate('originalMeme', 'title imageUrl')
    .populate('finalMeme', 'title imageUrl');
};

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

module.exports = Collaboration;
