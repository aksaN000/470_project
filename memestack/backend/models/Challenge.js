// 🏆 Challenge Model
// Defines the schema for meme challenges and contests

const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['contest', 'challenge', 'collaboration'],
        default: 'challenge'
    },
    category: {
        type: String,
        enum: [
            'reaction', 'mocking', 'success', 'fail', 'advice',
            'rage', 'philosoraptor', 'first_world_problems', 
            'conspiracy', 'confession', 'socially_awkward',
            'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
        ],
        default: 'freestyle'
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemeTemplate',
        default: null
    },
    rules: [{
        type: String,
        maxlength: 200
    }],
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    maxParticipants: {
        type: Number,
        min: 2,
        max: 1000,
        default: 100
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'voting', 'completed', 'cancelled'],
        default: 'draft'
    },
    prizes: [{
        position: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        value: String
    }],
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        submissions: [{
            meme: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meme',
                required: true
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            votes: {
                type: Number,
                default: 0
            },
            rank: {
                type: Number,
                default: null
            }
        }]
    }],
    votingSystem: {
        type: {
            type: String,
            enum: ['public', 'jury', 'hybrid'],
            default: 'public'
        },
        allowMultipleVotes: {
            type: Boolean,
            default: false
        },
        votingEndDate: {
            type: Date,
            default: null
        }
    },
    judges: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['judge', 'moderator'],
            default: 'judge'
        }
    }],
    winners: [{
        position: {
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        meme: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meme',
            required: true
        },
        score: {
            type: Number,
            default: 0
        },
        announcedAt: {
            type: Date,
            default: Date.now
        }
    }],
    stats: {
        totalSubmissions: {
            type: Number,
            default: 0
        },
        totalVotes: {
            type: Number,
            default: 0
        },
        totalViews: {
            type: Number,
            default: 0
        },
        participantCount: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    featuredAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
challengeSchema.index({ status: 1, startDate: -1 });
challengeSchema.index({ creator: 1, createdAt: -1 });
challengeSchema.index({ category: 1, status: 1 });
challengeSchema.index({ endDate: 1, status: 1 });
challengeSchema.index({ featured: 1, createdAt: -1 });
challengeSchema.index({ 'participants.user': 1 });

// Virtual for checking if challenge is active
challengeSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.startDate <= now && 
           this.endDate > now;
});

// Virtual for checking if voting is active
challengeSchema.virtual('isVotingActive').get(function() {
    const now = new Date();
    return this.status === 'voting' && 
           (!this.votingSystem.votingEndDate || this.votingSystem.votingEndDate > now);
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
    if (this.status === 'completed' || this.status === 'cancelled') return 0;
    
    const now = new Date();
    const endDate = this.status === 'voting' && this.votingSystem.votingEndDate 
        ? this.votingSystem.votingEndDate 
        : this.endDate;
    
    const diffTime = endDate - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Instance method to join challenge
challengeSchema.methods.joinChallenge = function(userId) {
    if (this.participants.find(p => p.user.toString() === userId.toString())) {
        throw new Error('User already joined this challenge');
    }
    
    if (this.participants.length >= this.maxParticipants) {
        throw new Error('Challenge is full');
    }
    
    if (!this.isActive) {
        throw new Error('Challenge is not active');
    }
    
    this.participants.push({ user: userId });
    this.stats.participantCount = this.participants.length;
    return this.save();
};

// Instance method to submit meme
challengeSchema.methods.submitMeme = function(userId, memeId) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) {
        throw new Error('User is not a participant of this challenge');
    }
    
    if (!this.isActive) {
        throw new Error('Challenge is not accepting submissions');
    }
    
    participant.submissions.push({ meme: memeId });
    this.stats.totalSubmissions++;
    return this.save();
};

// Static method to get trending challenges
challengeSchema.statics.getTrending = function() {
    return this.find({
        status: { $in: ['active', 'voting'] },
        isPublic: true
    })
    .sort({ 'stats.participantCount': -1, 'stats.totalSubmissions': -1 })
    .limit(10)
    .populate('creator', 'username profile.displayName profile.avatar')
    .populate('template', 'name imageUrl');
};

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
