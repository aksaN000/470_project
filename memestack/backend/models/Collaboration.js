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
    }],
    templateUsed: {
        type: String,
        default: null
    },
    workflow: [{
        step: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: null
        },
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    }],
    mergeHistory: [{
        fromFork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collaboration'
        },
        mergedAt: {
            type: Date,
            default: Date.now
        },
        mergedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        mergeData: {
            versionsAdded: { type: Number, default: 0 },
            commentsAdded: { type: Number, default: 0 },
            collaboratorsAdded: { type: Number, default: 0 }
        }
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

// Instance method to merge fork back to parent
collaborationSchema.methods.mergeFromFork = function(forkId, options = {}) {
    const { mergeVersions = true, mergeComments = false, mergeCollaborators = false } = options;
    
    return this.constructor.findById(forkId).then(fork => {
        if (!fork || fork.parentCollaboration.toString() !== this._id.toString()) {
            throw new Error('Invalid fork for merging');
        }
        
        const mergeData = {
            mergedVersions: [],
            mergedComments: [],
            mergedCollaborators: []
        };
        
        if (mergeVersions && fork.versions.length > 0) {
            // Merge versions from fork
            fork.versions.forEach(version => {
                const newVersion = {
                    ...version.toObject(),
                    version: this.versions.length + 1,
                    mergedFrom: forkId,
                    isCurrent: false
                };
                this.versions.push(newVersion);
                mergeData.mergedVersions.push(newVersion);
            });
        }
        
        if (mergeComments && fork.comments.length > 0) {
            // Merge comments from fork
            fork.comments.forEach(comment => {
                this.comments.push({
                    ...comment.toObject(),
                    mergedFrom: forkId
                });
                mergeData.mergedComments.push(comment);
            });
        }
        
        if (mergeCollaborators && fork.collaborators.length > 0) {
            // Merge unique collaborators from fork
            fork.collaborators.forEach(forkCollab => {
                const exists = this.collaborators.some(collab => 
                    collab.user.toString() === forkCollab.user.toString()
                );
                if (!exists) {
                    this.collaborators.push({
                        ...forkCollab.toObject(),
                        joinedAt: new Date(),
                        contributionScore: Math.floor(forkCollab.contributionScore / 2) // Reduce score for merge
                    });
                    mergeData.mergedCollaborators.push(forkCollab);
                }
            });
        }
        
        // Update stats
        this.stats.totalVersions = this.versions.length;
        this.stats.totalComments = this.comments.length;
        this.stats.totalContributors = this.collaborators.length + 1;
        
        return this.save().then(() => mergeData);
    });
};

// Instance method to get collaboration insights
collaborationSchema.methods.getInsights = function() {
    const now = new Date();
    const daysSinceCreation = (now - this.createdAt) / (1000 * 60 * 60 * 24);
    
    const insights = {
        engagement: {
            versionsPerDay: this.versions.length / Math.max(daysSinceCreation, 1),
            commentsPerDay: this.comments.length / Math.max(daysSinceCreation, 1),
            collaboratorGrowthRate: this.collaborators.length / Math.max(daysSinceCreation, 1)
        },
        quality: {
            averageVersionQuality: this.versions.reduce((sum, v) => sum + (v.approved ? 10 : 5), 0) / Math.max(this.versions.length, 1),
            collaboratorRetention: this.collaborators.filter(c => 
                (now - c.lastActive) < (7 * 24 * 60 * 60 * 1000) // Active in last week
            ).length / Math.max(this.collaborators.length, 1),
            completionScore: this.status === 'completed' ? 100 : 
                            this.status === 'reviewing' ? 75 :
                            this.status === 'active' ? 50 : 25
        },
        activity: {
            isHot: this.versions.length > 5 && daysSinceCreation < 7,
            isTrending: this.collaborators.length > 3 && this.stats.totalViews > 100,
            needsAttention: daysSinceCreation > 7 && this.versions.length === 0,
            isSuccessful: this.status === 'completed' && this.stats.totalForks > 0
        },
        recommendations: []
    };
    
    // Generate recommendations
    if (insights.activity.needsAttention) {
        insights.recommendations.push('Consider inviting more collaborators or creating the first version');
    }
    if (insights.engagement.versionsPerDay < 0.1) {
        insights.recommendations.push('Try adding more engaging content or clearer collaboration goals');
    }
    if (insights.quality.collaboratorRetention < 0.5) {
        insights.recommendations.push('Focus on improving collaborator engagement and communication');
    }
    if (this.versions.length > 0 && insights.quality.averageVersionQuality < 7) {
        insights.recommendations.push('Consider implementing version approval process for higher quality');
    }
    
    return insights;
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
    // Always compare userId as string to avoid ObjectId mismatch
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    return this.find({
        $or: [
            { owner: userIdStr },
            { 'collaborators.user': userIdStr, status: { $ne: 'draft' } }
        ]
    })
    .sort({ updatedAt: -1 })
    .populate('owner', 'username profile.displayName profile.avatar')
    .populate('originalMeme', 'title imageUrl')
    .populate('finalMeme', 'title imageUrl');
};

// Static method to create collaboration template
collaborationSchema.statics.createTemplate = function(templateData) {
    const {
        name,
        description,
        category,
        defaultSettings,
        requiredRoles = ['owner', 'contributor'],
        workflow = [],
        tags = []
    } = templateData;
    
    return {
        name,
        description,
        category, // 'meme-remix', 'group-project', 'challenge-response', 'tutorial'
        defaultSettings: {
            isPublic: true,
            allowForks: true,
            requireApproval: false,
            maxCollaborators: 10,
            ...defaultSettings
        },
        requiredRoles,
        workflow: workflow.length > 0 ? workflow : [
            { step: 1, name: 'Planning', description: 'Define collaboration goals and invite team' },
            { step: 2, name: 'Creation', description: 'Create initial versions and iterations' },
            { step: 3, name: 'Review', description: 'Review and refine versions' },
            { step: 4, name: 'Finalization', description: 'Complete and publish final version' }
        ],
        tags: [...tags, 'template'],
        createdAt: new Date()
    };
};

// Static method to get collaboration templates
collaborationSchema.statics.getTemplates = function(category = null) {
    const templates = [
        this.createTemplate({
            name: 'Meme Remix Collaboration',
            description: 'Collaborate on remixing and improving existing memes',
            category: 'meme-remix',
            defaultSettings: { maxCollaborators: 5, requireApproval: false },
            tags: ['remix', 'creative', 'quick']
        }),
        this.createTemplate({
            name: 'Group Meme Project',
            description: 'Large-scale collaborative meme creation with multiple contributors',
            category: 'group-project',
            defaultSettings: { maxCollaborators: 15, requireApproval: true },
            requiredRoles: ['owner', 'admin', 'editor', 'contributor'],
            tags: ['group', 'structured', 'long-term']
        }),
        this.createTemplate({
            name: 'Challenge Response',
            description: 'Respond to community challenges with collaborative solutions',
            category: 'challenge-response',
            defaultSettings: { maxCollaborators: 8, allowForks: true },
            tags: ['challenge', 'community', 'competitive']
        }),
        this.createTemplate({
            name: 'Tutorial Creation',
            description: 'Create educational content and tutorials collaboratively',
            category: 'tutorial',
            defaultSettings: { maxCollaborators: 6, requireApproval: true },
            requiredRoles: ['owner', 'editor', 'reviewer', 'contributor'],
            tags: ['educational', 'tutorial', 'structured']
        }),
        this.createTemplate({
            name: 'Quick Collaboration',
            description: 'Fast-paced collaboration for simple improvements',
            category: 'quick',
            defaultSettings: { maxCollaborators: 3, requireApproval: false },
            workflow: [
                { step: 1, name: 'Setup', description: 'Quick setup and invite 1-2 collaborators' },
                { step: 2, name: 'Create', description: 'Create 2-3 versions rapidly' },
                { step: 3, name: 'Finish', description: 'Pick best version and complete' }
            ],
            tags: ['quick', 'simple', 'fast']
        })
    ];
    
    return category ? templates.filter(t => t.category === category) : templates;
};

// Static method to create from template
collaborationSchema.statics.createFromTemplate = function(templateName, collaborationData, ownerId) {
    const templates = this.getTemplates();
    const template = templates.find(t => t.name === templateName);
    
    if (!template) {
        throw new Error('Template not found');
    }
    
    const collaboration = new this({
        title: collaborationData.title || `${template.name} - ${new Date().toLocaleDateString()}`,
        description: collaborationData.description || template.description,
        type: collaborationData.type || 'collaboration',
        owner: ownerId,
        status: 'draft',
        settings: {
            ...template.defaultSettings,
            ...collaborationData.settings
        },
        tags: [
            ...template.tags,
            ...(collaborationData.tags || [])
        ],
        workflow: template.workflow,
        templateUsed: templateName,
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
    
    return collaboration;
};

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

module.exports = Collaboration;
