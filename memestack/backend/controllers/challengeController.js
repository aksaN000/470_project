// 🏆 Challenge Controller
// Handles all challenge and contest related operations

const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Meme = require('../models/Meme');
const mongoose = require('mongoose');

// Get all challenges with filtering and pagination
const getChallenges = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            status,
            category,
            type,
            sort = 'recent',
            search
        } = req.query;

        // Build filter object
        const filter = { isPublic: true };
        
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (type) filter.type = type;
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'popular':
                sortObj = { 'stats.participantCount': -1, 'stats.totalSubmissions': -1 };
                break;
            case 'ending_soon':
                sortObj = { endDate: 1 };
                break;
            case 'featured':
                sortObj = { featured: -1, createdAt: -1 };
                break;
            case 'recent':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        const challenges = await Challenge.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('template', 'name imageUrl')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Challenge.countDocuments(filter);

        // Add computed fields
        const challengesWithExtras = challenges.map(challenge => ({
            ...challenge,
            isActive: new Date() >= new Date(challenge.startDate) && 
                     new Date() < new Date(challenge.endDate) && 
                     challenge.status === 'active',
            daysRemaining: Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
        }));

        res.json({
            challenges: challengesWithExtras,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting challenges:', error);
        res.status(500).json({ message: 'Error fetching challenges', error: error.message });
    }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const challenge = await Challenge.findById(id)
            .populate('creator', 'username profile.displayName profile.avatar stats.totalMemes')
            .populate('template', 'name imageUrl category')
            .populate('participants.user', 'username profile.displayName profile.avatar')
            .populate({
                path: 'participants.submissions.meme',
                populate: {
                    path: 'creator',
                    select: 'username profile.displayName profile.avatar'
                }
            })
            .populate('judges.user', 'username profile.displayName profile.avatar')
            .populate('winners.user', 'username profile.displayName profile.avatar')
            .populate('winners.meme', 'title imageUrl stats.likes stats.views');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Increment view count
        challenge.stats.totalViews++;
        await challenge.save();

        res.json(challenge);
    } catch (error) {
        console.error('Error getting challenge:', error);
        res.status(500).json({ message: 'Error fetching challenge', error: error.message });
    }
};

// Create new challenge
const createChallenge = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            type,
            category,
            template,
            rules,
            endDate,
            maxParticipants,
            isPublic,
            prizes,
            votingSystem,
            judges,
            tags
        } = req.body;

        // Validate end date
        if (new Date(endDate) <= new Date()) {
            return res.status(400).json({ message: 'End date must be in the future' });
        }

        const challenge = new Challenge({
            title,
            description,
            creator: userId,
            type,
            category,
            template,
            rules: Array.isArray(rules) ? rules : [],
            endDate: new Date(endDate),
            maxParticipants: maxParticipants || 100,
            isPublic: isPublic !== false,
            prizes: Array.isArray(prizes) ? prizes : [],
            votingSystem: votingSystem || { type: 'public' },
            judges: Array.isArray(judges) ? judges : [],
            tags: Array.isArray(tags) ? tags : []
        });

        await challenge.save();
        
        // Populate created challenge
        const populatedChallenge = await Challenge.findById(challenge._id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('template', 'name imageUrl');

        res.status(201).json(populatedChallenge);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Error creating challenge', error: error.message });
    }
};

// Update challenge
const updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check permissions
        if (challenge.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this challenge' });
        }

        // Prevent updates if challenge is active and has participants
        if (challenge.status === 'active' && challenge.participants.length > 0) {
            const allowedUpdates = ['description', 'rules', 'prizes'];
            const attemptedUpdates = Object.keys(updates);
            const hasDisallowedUpdates = attemptedUpdates.some(update => !allowedUpdates.includes(update));
            
            if (hasDisallowedUpdates) {
                return res.status(400).json({ 
                    message: 'Cannot modify core challenge settings once participants have joined' 
                });
            }
        }

        Object.assign(challenge, updates);
        await challenge.save();

        const updatedChallenge = await Challenge.findById(id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('template', 'name imageUrl');

        res.json(updatedChallenge);
    } catch (error) {
        console.error('Error updating challenge:', error);
        res.status(500).json({ message: 'Error updating challenge', error: error.message });
    }
};

// Join challenge
const joinChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        await challenge.joinChallenge(userId);

        res.json({ message: 'Successfully joined challenge' });
    } catch (error) {
        console.error('Error joining challenge:', error);
        res.status(400).json({ message: error.message });
    }
};

// Submit meme to challenge
const submitMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const { memeId } = req.body;
        const userId = req.user.id;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Verify meme exists and belongs to user
        const meme = await Meme.findById(memeId);
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        if (meme.creator.toString() !== userId) {
            return res.status(403).json({ message: 'You can only submit your own memes' });
        }

        await challenge.submitMeme(userId, memeId);

        res.json({ message: 'Meme submitted successfully' });
    } catch (error) {
        console.error('Error submitting meme:', error);
        res.status(400).json({ message: error.message });
    }
};

// Vote on challenge submission
const voteOnSubmission = async (req, res) => {
    try {
        const { id, submissionId } = req.params;
        const userId = req.user.id;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.status !== 'voting') {
            return res.status(400).json({ message: 'Challenge is not in voting phase' });
        }

        // Find the submission
        let submission = null;
        let participant = null;
        for (const p of challenge.participants) {
            submission = p.submissions.id(submissionId);
            if (submission) {
                participant = p;
                break;
            }
        }

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if user can vote (not their own submission, public voting, etc.)
        if (participant.user.toString() === userId) {
            return res.status(400).json({ message: 'Cannot vote on your own submission' });
        }

        if (challenge.votingSystem.type === 'jury') {
            const isJudge = challenge.judges.some(judge => judge.user.toString() === userId);
            if (!isJudge) {
                return res.status(403).json({ message: 'Only judges can vote in this challenge' });
            }
        }

        submission.votes++;
        challenge.stats.totalVotes++;
        await challenge.save();

        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        console.error('Error voting on submission:', error);
        res.status(500).json({ message: 'Error recording vote', error: error.message });
    }
};

// Get trending challenges
const getTrendingChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.getTrending();
        res.json(challenges);
    } catch (error) {
        console.error('Error getting trending challenges:', error);
        res.status(500).json({ message: 'Error fetching trending challenges', error: error.message });
    }
};

// Get user's challenges
const getUserChallenges = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'all' } = req.query;

        let filter = {};
        switch (type) {
            case 'created':
                filter = { creator: userId };
                break;
            case 'joined':
                filter = { 'participants.user': userId };
                break;
            case 'all':
            default:
                filter = {
                    $or: [
                        { creator: userId },
                        { 'participants.user': userId }
                    ]
                };
                break;
        }

        const challenges = await Challenge.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('template', 'name imageUrl')
            .sort({ updatedAt: -1 });

        res.json(challenges);
    } catch (error) {
        console.error('Error getting user challenges:', error);
        res.status(500).json({ message: 'Error fetching user challenges', error: error.message });
    }
};

// Delete challenge
const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check permissions
        if (challenge.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this challenge' });
        }

        // Don't allow deletion if challenge is active with participants
        if (challenge.status === 'active' && challenge.participants.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete active challenge with participants' 
            });
        }

        await Challenge.findByIdAndDelete(id);
        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        console.error('Error deleting challenge:', error);
        res.status(500).json({ message: 'Error deleting challenge', error: error.message });
    }
};

module.exports = {
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    joinChallenge,
    submitMeme,
    voteOnSubmission,
    getTrendingChallenges,
    getUserChallenges,
    deleteChallenge
};
