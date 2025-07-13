// 🤝 Collaboration Controller
// Handles all collaboration, remix, and collaborative editing operations

const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const Meme = require('../models/Meme');
const Challenge = require('../models/Challenge');
const Group = require('../models/Group');
const mongoose = require('mongoose');

// Get all collaborations with filtering and pagination
const getCollaborations = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            type,
            status,
            sort = 'recent',
            search
        } = req.query;

        // Build filter object
        const filter = { 'settings.isPublic': true };
        
        if (type) filter.type = type;
        if (status) filter.status = status;
        
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
                sortObj = { 'stats.totalContributors': -1, 'stats.totalViews': -1 };
                break;
            case 'active':
                sortObj = { updatedAt: -1 };
                break;
            case 'recent':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        const collaborations = await Collaboration.find(filter)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl')
            .populate('finalMeme', 'title imageUrl')
            .populate('challenge', 'title type')
            .populate('group', 'name slug')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Collaboration.countDocuments(filter);

        res.json({
            collaborations,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting collaborations:', error);
        res.status(500).json({ message: 'Error fetching collaborations', error: error.message });
    }
};

// Get collaboration by ID
const getCollaborationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        
        const collaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar stats.totalMemes')
            .populate('collaborators.user', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl creator')
            .populate('finalMeme', 'title imageUrl stats.likes stats.views')
            .populate('challenge', 'title type status')
            .populate('group', 'name slug avatar')
            .populate('parentCollaboration', 'title type owner')
            .populate({
                path: 'versions.createdBy',
                select: 'username profile.displayName profile.avatar'
            })
            .populate({
                path: 'versions.meme',
                select: 'title imageUrl stats.likes stats.views'
            })
            .populate('comments.user', 'username profile.displayName profile.avatar')
            .populate('comments.replies.user', 'username profile.displayName profile.avatar');

        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check if user can view this collaboration
        if (!collaboration.settings.isPublic && userId) {
            const canView = collaboration.isCollaborator(userId);
            if (!canView) {
                return res.status(403).json({ message: 'This collaboration is private' });
            }
        }

        // Increment view count
        collaboration.stats.totalViews++;
        await collaboration.save();

        const response = {
            ...collaboration.toJSON(),
            userRole: userId ? collaboration.getUserRole(userId) : null,
            isCollaborator: userId ? collaboration.isCollaborator(userId) : false
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting collaboration:', error);
        res.status(500).json({ message: 'Error fetching collaboration', error: error.message });
    }
};

// Create new collaboration
const createCollaboration = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            type,
            originalMeme,
            challenge,
            group,
            settings,
            remixInfo,
            tags
        } = req.body;

        // Validate original meme if provided
        if (originalMeme) {
            const meme = await Meme.findById(originalMeme);
            if (!meme) {
                return res.status(404).json({ message: 'Original meme not found' });
            }
        }

        // Validate challenge if provided
        if (challenge) {
            const challengeDoc = await Challenge.findById(challenge);
            if (!challengeDoc) {
                return res.status(404).json({ message: 'Challenge not found' });
            }
        }

        // Validate group if provided
        if (group) {
            const groupDoc = await Group.findById(group);
            if (!groupDoc) {
                return res.status(404).json({ message: 'Group not found' });
            }
            
            // Check if user is member of the group
            if (!groupDoc.isMember(userId)) {
                return res.status(403).json({ message: 'You must be a member of the group' });
            }
        }

        const collaboration = new Collaboration({
            title,
            description,
            type,
            owner: userId,
            originalMeme,
            challenge,
            group,
            settings: {
                isPublic: true,
                allowForks: true,
                requireApproval: false,
                maxCollaborators: 10,
                allowAnonymous: false,
                ...settings
            },
            remixInfo: remixInfo || {},
            tags: Array.isArray(tags) ? tags : []
        });

        await collaboration.save();
        
        // Populate created collaboration
        const populatedCollaboration = await Collaboration.findById(collaboration._id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl')
            .populate('challenge', 'title type')
            .populate('group', 'name slug');

        res.status(201).json(populatedCollaboration);
    } catch (error) {
        console.error('Error creating collaboration:', error);
        res.status(500).json({ message: 'Error creating collaboration', error: error.message });
    }
};

// Update collaboration
const updateCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check permissions
        const userRole = collaboration.getUserRole(userId);
        if (!['owner', 'admin'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to update this collaboration' });
        }

        // Prevent updates to sensitive fields
        delete updates.owner;
        delete updates.collaborators;
        delete updates.versions;
        delete updates.stats;

        Object.assign(collaboration, updates);
        await collaboration.save();

        const updatedCollaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl')
            .populate('finalMeme', 'title imageUrl');

        res.json(updatedCollaboration);
    } catch (error) {
        console.error('Error updating collaboration:', error);
        res.status(500).json({ message: 'Error updating collaboration', error: error.message });
    }
};

// Join collaboration
const joinCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { message } = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        if (collaboration.isCollaborator(userId)) {
            return res.status(400).json({ message: 'You are already a collaborator' });
        }

        if (collaboration.status !== 'active') {
            return res.status(400).json({ message: 'Collaboration is not accepting new members' });
        }

        // Check if there's already a pending invite
        const existingInvite = collaboration.pendingInvites.find(invite => 
            invite.user.toString() === userId
        );

        if (existingInvite) {
            // Accept the invite
            collaboration.pendingInvites = collaboration.pendingInvites.filter(invite => 
                invite.user.toString() !== userId
            );
            await collaboration.addCollaborator(userId, existingInvite.role);
            return res.json({ message: 'Successfully joined collaboration' });
        }

        // If collaboration is open, join directly
        if (!collaboration.settings.requireApproval) {
            await collaboration.addCollaborator(userId, 'contributor');
            return res.json({ message: 'Successfully joined collaboration' });
        }

        // If requires approval, this would need to be handled by invites
        return res.status(400).json({ 
            message: 'This collaboration requires an invite to join' 
        });
    } catch (error) {
        console.error('Error joining collaboration:', error);
        res.status(400).json({ message: error.message });
    }
};

// Invite user to collaboration
const inviteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role = 'contributor', message = '' } = req.body;
        const userId = req.user.id;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check permissions
        const userRole = collaboration.getUserRole(userId);
        if (!['owner', 'admin', 'editor'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to invite users' });
        }

        // Find user by username
        const invitedUser = await User.findOne({ username });
        if (!invitedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await collaboration.inviteUser(invitedUser._id, userId, role, message);
        res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(400).json({ message: error.message });
    }
};

// Create new version
const createVersion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, memeId, changes = [], description = '' } = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check if user is collaborator
        if (!collaboration.isCollaborator(userId)) {
            return res.status(403).json({ message: 'You must be a collaborator to create versions' });
        }

        // Verify meme exists
        const meme = await Meme.findById(memeId);
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        await collaboration.createVersion(userId, title, memeId, changes, description);

        // Update collaborator contribution score
        const collaborator = collaboration.collaborators.find(c => 
            c.user.toString() === userId
        );
        if (collaborator) {
            collaborator.contributionScore += 10; // Points for creating version
            collaborator.lastActive = new Date();
        }

        await collaboration.save();

        res.json({ message: 'Version created successfully' });
    } catch (error) {
        console.error('Error creating version:', error);
        res.status(500).json({ message: 'Error creating version', error: error.message });
    }
};

// Fork collaboration
const forkCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title } = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        const forkedCollaboration = collaboration.fork(userId, title);
        await forkedCollaboration.save();

        // Increment fork count
        collaboration.stats.totalForks++;
        await collaboration.save();

        const populatedFork = await Collaboration.findById(forkedCollaboration._id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl')
            .populate('parentCollaboration', 'title type');

        res.status(201).json(populatedFork);
    } catch (error) {
        console.error('Error forking collaboration:', error);
        res.status(400).json({ message: error.message });
    }
};

// Add comment
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { content, versionNumber, elementId } = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        collaboration.comments.push({
            user: userId,
            content,
            versionNumber,
            elementId
        });

        await collaboration.save();

        const populatedComment = await Collaboration.findById(id)
            .populate('comments.user', 'username profile.displayName profile.avatar')
            .select('comments');

        const newComment = populatedComment.comments[populatedComment.comments.length - 1];
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Get trending collaborations
const getTrendingCollaborations = async (req, res) => {
    try {
        const collaborations = await Collaboration.getTrending();
        res.json(collaborations);
    } catch (error) {
        console.error('Error getting trending collaborations:', error);
        res.status(500).json({ message: 'Error fetching trending collaborations', error: error.message });
    }
};

// Get user's collaborations
const getUserCollaborations = async (req, res) => {
    try {
        const userId = req.user.id;
        const collaborations = await Collaboration.getUserCollaborations(userId);
        res.json(collaborations);
    } catch (error) {
        console.error('Error getting user collaborations:', error);
        res.status(500).json({ message: 'Error fetching user collaborations', error: error.message });
    }
};

// Get meme remixes
const getMemeRemixes = async (req, res) => {
    try {
        const { memeId } = req.params;
        
        const remixes = await Collaboration.find({
            originalMeme: memeId,
            type: 'remix',
            'settings.isPublic': true
        })
        .populate('owner', 'username profile.displayName profile.avatar')
        .populate('finalMeme', 'title imageUrl stats.likes stats.views')
        .sort({ createdAt: -1 });

        res.json(remixes);
    } catch (error) {
        console.error('Error getting meme remixes:', error);
        res.status(500).json({ message: 'Error fetching remixes', error: error.message });
    }
};

// Delete collaboration
const deleteCollaboration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check permissions
        if (collaboration.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Only the owner can delete this collaboration' });
        }

        // Don't allow deletion if there are multiple contributors
        if (collaboration.collaborators.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete collaboration with active contributors' 
            });
        }

        await Collaboration.findByIdAndDelete(id);
        res.json({ message: 'Collaboration deleted successfully' });
    } catch (error) {
        console.error('Error deleting collaboration:', error);
        res.status(500).json({ message: 'Error deleting collaboration', error: error.message });
    }
};

module.exports = {
    getCollaborations,
    getCollaborationById,
    createCollaboration,
    updateCollaboration,
    joinCollaboration,
    inviteUser,
    createVersion,
    forkCollaboration,
    addComment,
    getTrendingCollaborations,
    getUserCollaborations,
    getMemeRemixes,
    deleteCollaboration
};
