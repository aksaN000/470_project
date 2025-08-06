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

        // Build filter object - Only show published public collaborations
        const filter = { 
            'settings.isPublic': true,
            status: { $ne: 'draft' } // Exclude drafts from public view
        };
        
        console.log('🔍 getCollaborations - Filter before type/status:', filter);
        
        if (type) filter.type = type;
        if (status) filter.status = status; // Allow status filtering on top of the base filter
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        console.log('🔍 getCollaborations - Final filter:', filter);

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
        
        console.log('🔍 getCollaborations - Results:');
        console.log('   Found collaborations:', collaborations.length);
        console.log('   Total count:', total);
        console.log('   Collaborations data:', collaborations.map(c => ({
            id: c._id,
            title: c.title,
            type: c.type,
            settings: c.settings
        })));

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
        const userId = req.user?._id || req.user?.userId; // Fix: use _id instead of id
        
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
        const userId = req.user._id || req.user.userId; // Fix: use _id instead of id
        console.log('Creating collaboration for user:', userId); // Debug log
        console.log('Request body:', req.body); // Debug log
        
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

        console.log('Collaboration object before save:', {
            title: collaboration.title,
            type: collaboration.type,
            owner: collaboration.owner,
            originalMeme: collaboration.originalMeme,
            settings: collaboration.settings
        }); // Debug log

        await collaboration.save();
        
        console.log('✅ Collaboration saved successfully:', {
            id: collaboration._id,
            title: collaboration.title,
            isPublic: collaboration.settings.isPublic,
            type: collaboration.type,
            owner: collaboration.owner
        });
        
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
        const userId = req.user._id || req.user.userId;
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

        // Use findByIdAndUpdate to avoid full validation on partial updates
        const updatedCollaboration = await Collaboration.findByIdAndUpdate(
            id, 
            { $set: updates }, 
            { new: true, runValidators: false } // Skip validation for partial updates
        )
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
        const userId = req.user._id || req.user.userId;
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
        const userId = req.user._id || req.user.userId;

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
        console.log('🔍 Create version - req.user:', req.user);
        console.log('🔍 Create version - req.user._id:', req.user?._id);
        console.log('🔍 Create version - req.user.userId:', req.user?.userId);
        
        const userId = req.user._id || req.user.userId;
        const { title, memeId, changes = [], description = '' } = req.body;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        console.log('🔍 Collaboration owner:', collaboration.owner);
        console.log('🔍 User ID:', userId);
        console.log('🔍 User ID type:', typeof userId);
        console.log('🔍 Owner ID type:', typeof collaboration.owner);
        console.log('🔍 isCollaborator result:', collaboration.isCollaborator(userId));

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
        console.log('🔍 Full request object keys:', Object.keys(req));
        console.log('🔍 User object details:', req.user);
        console.log('🔍 User object type:', typeof req.user);
        console.log('🔍 User _id:', req.user?._id);
        console.log('🔍 User userId:', req.user?.userId);
        console.log('🔍 User id:', req.user?.id);
        
        const userId = req.user?._id || req.user?.userId || req.user?.id;
        const { title } = req.body;
        
        console.log('🍴 Fork request:', { collaborationId: id, userId, title });
        console.log('🔍 Final userId value:', userId, 'type:', typeof userId);

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
        console.log('🔍 Comment - Full request object keys:', Object.keys(req));
        console.log('🔍 Comment - User object details:', req.user);
        console.log('🔍 Comment - User object type:', typeof req.user);
        console.log('🔍 Comment - User _id:', req.user?._id);
        console.log('🔍 Comment - User userId:', req.user?.userId);
        console.log('🔍 Comment - User id:', req.user?.id);
        
        const userId = req.user?._id || req.user?.userId || req.user?.id;
        const { content, versionNumber, elementId } = req.body;
        
        console.log('💬 Comment request:', { collaborationId: id, userId, content });
        console.log('🔍 Final userId value:', userId, 'type:', typeof userId);

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

// Get user's collaborations
const getUserCollaborations = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        const collaborations = await Collaboration.getUserCollaborations(userId);
        res.json({
            success: true,
            collaborations,
            total: collaborations.length
        });
    } catch (error) {
        console.error('Error getting user collaborations:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching user collaborations', 
            error: error.message 
        });
    }
};

// Get meme remixes
const getMemeRemixes = async (req, res) => {
    try {
        const { memeId } = req.params;
        
        const remixes = await Collaboration.find({
            originalMeme: memeId,
            type: 'remix',
            'settings.isPublic': true,
            status: { $ne: 'draft' } // Exclude drafts from public remixes
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
        const userId = req.user._id || req.user.userId;

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

// Get trending collaborations
const getTrendingCollaborations = async (req, res) => {
    try {
        const collaborations = await Collaboration.find({ 
            'settings.isPublic': true,
            status: { $in: ['active', 'completed'] }
        })
        .sort({ 
            'stats.totalViews': -1,
            'stats.totalContributors': -1,
            'stats.totalComments': -1,
            updatedAt: -1
        })
        .limit(20)
        .populate('owner', 'username profile.avatar')
        .populate('collaborators.user', 'username profile.avatar')
        .populate('originalMeme', 'title imageUrl')
        .populate('challenge', 'title description')
        .lean();

        console.log('🔍 getTrendingCollaborations - Results:');
        console.log('   Found trending collaborations:', collaborations.length);
        console.log('   Trending data:', collaborations.map(c => ({
            id: c._id,
            title: c.title,
            type: c.type,
            stats: c.stats
        })));

        res.json({ 
            success: true,
            data: collaborations || []
        });
    } catch (error) {
        console.error('Error fetching trending collaborations:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching trending collaborations', 
            data: []
        });
    }
};

// Remove collaborator
const removeCollaborator = async (req, res) => {
    try {
        const { id, collaboratorId } = req.params;
        const userId = req.user._id || req.user.userId;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check if user has permission to remove collaborators (owner or admin)
        if (!collaboration.isOwner(userId) && !collaboration.canUserInvite(userId)) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        await collaboration.removeCollaborator(collaboratorId);

        const updatedCollaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('collaborators.user', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl');

        res.json(updatedCollaboration);
    } catch (error) {
        console.error('Error removing collaborator:', error);
        res.status(400).json({ message: error.message });
    }
};

// Accept collaboration invite
const acceptInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.userId;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        await collaboration.acceptInvite(userId);

        const updatedCollaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('collaborators.user', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl');

        res.json({ message: 'Invite accepted successfully', collaboration: updatedCollaboration });
    } catch (error) {
        console.error('Error accepting invite:', error);
        res.status(400).json({ message: error.message });
    }
};

// Decline collaboration invite
const declineInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.userId;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        await collaboration.declineInvite(userId);

        res.json({ message: 'Invite declined successfully' });
    } catch (error) {
        console.error('Error declining invite:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update collaborator role
const updateCollaboratorRole = async (req, res) => {
    try {
        const { id, collaboratorId } = req.params;
        const { role } = req.body;
        const userId = req.user._id || req.user.userId;

        const collaboration = await Collaboration.findById(id);
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check if user has permission to update roles (owner or admin)
        if (!collaboration.isOwner(userId) && !collaboration.canUserInvite(userId)) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        await collaboration.updateCollaboratorRole(collaboratorId, role);

        const updatedCollaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('collaborators.user', 'username profile.displayName profile.avatar')
            .populate('originalMeme', 'title imageUrl');

        res.json(updatedCollaboration);
    } catch (error) {
        console.error('Error updating collaborator role:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get user's pending invites
const getPendingInvites = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;

        const collaborations = await Collaboration.find({
            'pendingInvites.user': userId
        })
        .populate('owner', 'username profile.displayName profile.avatar')
        .populate('originalMeme', 'title imageUrl')
        .populate('pendingInvites.invitedBy', 'username profile.displayName profile.avatar');

        const invites = collaborations.map(collab => {
            const userInvite = collab.pendingInvites.find(invite => 
                invite.user.toString() === userId
            );
            return {
                collaboration: {
                    _id: collab._id,
                    title: collab.title,
                    description: collab.description,
                    type: collab.type,
                    owner: collab.owner,
                    originalMeme: collab.originalMeme
                },
                invite: userInvite
            };
        });

        res.json(invites);
    } catch (error) {
        console.error('Error getting pending invites:', error);
        res.status(500).json({ message: 'Error getting pending invites', error: error.message });
    }
};

// Merge fork back to parent collaboration
const mergeFork = async (req, res) => {
    try {
        const { id } = req.params; // Parent collaboration ID
        const { forkId, mergeOptions = {} } = req.body;
        const userId = req.user._id || req.user.userId;

        const parentCollaboration = await Collaboration.findById(id);
        if (!parentCollaboration) {
            return res.status(404).json({ message: 'Parent collaboration not found' });
        }

        // Check if user has permission to merge (owner or admin)
        if (!parentCollaboration.isOwner(userId) && !parentCollaboration.canUserInvite(userId)) {
            return res.status(403).json({ message: 'Permission denied to merge fork' });
        }

        const mergeData = await parentCollaboration.mergeFromFork(forkId, mergeOptions);

        const updatedCollaboration = await Collaboration.findById(id)
            .populate('owner', 'username profile.displayName profile.avatar')
            .populate('collaborators.user', 'username profile.displayName profile.avatar')
            .populate('versions.createdBy', 'username profile.displayName profile.avatar');

        res.json({
            success: true,
            collaboration: updatedCollaboration,
            mergedData: mergeData,
            message: 'Fork merged successfully'
        });
    } catch (error) {
        console.error('Error merging fork:', error);
        res.status(500).json({ message: 'Error merging fork', error: error.message });
    }
};

// Get collaboration templates
const getCollaborationTemplates = async (req, res) => {
    try {
        const { category } = req.query;
        
        // Define collaboration templates
        const templates = [
            {
                _id: 'template_meme_remix',
                name: 'Meme Remix Project',
                description: 'Collaborative remixing of a popular meme template',
                type: 'remix',
                category: 'meme-remix',
                visibility: 'public',
                maxParticipants: 10,
                timeline: 'week',
                tags: ['remix', 'collaborative', 'meme'],
                guidelines: 'Work together to create the best remix variations',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: false,
                    maxCollaborators: 10,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_group_project',
                name: 'Group Meme Creation',
                description: 'Team-based meme creation with assigned roles',
                type: 'collaboration',
                category: 'group-project',
                visibility: 'public',
                maxParticipants: 6,
                timeline: 'month',
                tags: ['group', 'structured', 'roles'],
                guidelines: 'Each member takes on a specific role in the creation process',
                workflow: 'sequential',
                settings: {
                    isPublic: true,
                    allowForks: false,
                    requireApproval: true,
                    maxCollaborators: 6,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_challenge_response',
                name: 'Challenge Response',
                description: 'Collaborative response to a meme challenge',
                type: 'challenge_response',
                category: 'challenge-response',
                visibility: 'public',
                maxParticipants: 20,
                timeline: 'day',
                tags: ['challenge', 'competition', 'fast'],
                guidelines: 'Quick collaborative response to trending challenges',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: false,
                    maxCollaborators: 20,
                    allowAnonymous: true
                }
            },
            {
                _id: 'template_tutorial',
                name: 'Tutorial Creation',
                description: 'Create educational meme content together',
                type: 'template_creation',
                category: 'tutorial',
                visibility: 'public',
                maxParticipants: 5,
                timeline: 'month',
                tags: ['educational', 'tutorial', 'learning'],
                guidelines: 'Create step-by-step meme tutorials for the community',
                workflow: 'sequential',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: true,
                    maxCollaborators: 5,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_quick',
                name: 'Quick Collab',
                description: 'Fast, simple collaboration for immediate results',
                type: 'collaboration',
                category: 'quick',
                visibility: 'public',
                maxParticipants: 3,
                timeline: 'hour',
                tags: ['quick', 'simple', 'fast'],
                guidelines: 'Get it done fast with minimal overhead',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: false,
                    requireApproval: false,
                    maxCollaborators: 3,
                    allowAnonymous: true
                }
            }
        ];

        // Filter by category if provided
        const filteredTemplates = category 
            ? templates.filter(t => t.category === category)
            : templates;
        
        res.json({
            success: true,
            templates: filteredTemplates,
            categories: ['meme-remix', 'group-project', 'challenge-response', 'tutorial', 'quick']
        });
    } catch (error) {
        console.error('Error getting collaboration templates:', error);
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
};

// Create collaboration from template
const createFromTemplate = async (req, res) => {
    try {
        const { templateId, title, description, customSettings } = req.body;
        const userId = req.user._id || req.user.userId;

        // Get template by ID
        const templates = [
            {
                _id: 'template_meme_remix',
                name: 'Meme Remix Project',
                description: 'Collaborative remixing of a popular meme template',
                type: 'remix',
                category: 'meme-remix',
                maxParticipants: 10,
                tags: ['remix', 'collaborative', 'meme'],
                guidelines: 'Work together to create the best remix variations',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: false,
                    maxCollaborators: 10,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_group_project',
                name: 'Group Meme Creation',
                description: 'Team-based meme creation with assigned roles',
                type: 'collaboration',
                category: 'group-project',
                maxParticipants: 6,
                tags: ['group', 'structured', 'roles'],
                guidelines: 'Each member takes on a specific role in the creation process',
                workflow: 'sequential',
                settings: {
                    isPublic: true,
                    allowForks: false,
                    requireApproval: true,
                    maxCollaborators: 6,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_challenge_response',
                name: 'Challenge Response',
                description: 'Collaborative response to a meme challenge',
                type: 'challenge_response',
                category: 'challenge-response',
                maxParticipants: 20,
                tags: ['challenge', 'competition', 'fast'],
                guidelines: 'Quick collaborative response to trending challenges',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: false,
                    maxCollaborators: 20,
                    allowAnonymous: true
                }
            },
            {
                _id: 'template_tutorial',
                name: 'Tutorial Creation',
                description: 'Create educational meme content together',
                type: 'template_creation',
                category: 'tutorial',
                maxParticipants: 5,
                tags: ['educational', 'tutorial', 'learning'],
                guidelines: 'Create step-by-step meme tutorials for the community',
                workflow: 'sequential',
                settings: {
                    isPublic: true,
                    allowForks: true,
                    requireApproval: true,
                    maxCollaborators: 5,
                    allowAnonymous: false
                }
            },
            {
                _id: 'template_quick',
                name: 'Quick Collab',
                description: 'Fast, simple collaboration for immediate results',
                type: 'collaboration',
                category: 'quick',
                maxParticipants: 3,
                tags: ['quick', 'simple', 'fast'],
                guidelines: 'Get it done fast with minimal overhead',
                workflow: 'parallel',
                settings: {
                    isPublic: true,
                    allowForks: false,
                    requireApproval: false,
                    maxCollaborators: 3,
                    allowAnonymous: true
                }
            }
        ];

        const template = templates.find(t => t._id === templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Create collaboration using template
        const collaborationData = {
            title: title || `${template.name} - ${new Date().toLocaleDateString()}`,
            description: description || template.description,
            type: template.type,
            category: template.category,
            owner: userId,
            participants: [{
                user: userId,
                role: 'owner',
                joinedAt: new Date(),
                permissions: ['read', 'write', 'manage', 'invite', 'remove']
            }],
            settings: {
                ...template.settings,
                ...customSettings
            },
            tags: template.tags,
            guidelines: template.guidelines,
            workflow: template.workflow,
            status: 'active',
            metadata: {
                templateId,
                templateName: template.name,
                createdFromTemplate: true
            },
            analytics: {
                totalViews: 0,
                uniqueViewers: 0,
                totalContributions: 0,
                avgRating: 0,
                totalLikes: 0,
                totalShares: 0,
                activityScore: 0
            }
        };

        const collaboration = new Collaboration(collaborationData);
        await collaboration.save();

        const populatedCollaboration = await Collaboration.findById(collaboration._id)
            .populate('owner', 'username profile.displayName profile.avatar');

        res.status(201).json({
            success: true,
            collaboration: populatedCollaboration,
            message: `Collaboration created from ${template.name} template`
        });
    } catch (error) {
        console.error('Error creating collaboration from template:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get collaboration insights
const getCollaborationInsights = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.userId;

        const collaboration = await Collaboration.findById(id)
            .populate('participants.user', 'username profile.displayName profile.avatar')
            .populate('owner', 'username profile.displayName profile.avatar');
            
        if (!collaboration) {
            return res.status(404).json({ message: 'Collaboration not found' });
        }

        // Check if user is a collaborator to view insights
        const isCollaborator = collaboration.participants.some(p => 
            p.user._id.toString() === userId.toString()
        ) || collaboration.owner._id.toString() === userId.toString();
        
        if (!isCollaborator && !collaboration.settings.isPublic) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        // Calculate insights
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Participation insights
        const totalParticipants = collaboration.participants.length;
        const activeParticipants = collaboration.participants.filter(p => 
            p.lastActive && p.lastActive > weekAgo
        ).length;

        // Activity insights
        const recentActivity = collaboration.activityFeed ? collaboration.activityFeed.filter(
            activity => activity.timestamp > weekAgo
        ).length : 0;

        const monthlyActivity = collaboration.activityFeed ? collaboration.activityFeed.filter(
            activity => activity.timestamp > monthAgo
        ).length : 0;

        // Performance metrics
        const avgResponseTime = calculateAverageResponseTime(collaboration.activityFeed || []);
        const engagementRate = totalParticipants > 0 ? (activeParticipants / totalParticipants) * 100 : 0;

        // Growth trends
        const growthTrend = calculateGrowthTrend(collaboration.participants);
        
        // Most active contributors
        const contributorStats = calculateContributorStats(collaboration.activityFeed || [], collaboration.participants);

        const insights = {
            overview: {
                totalParticipants,
                activeParticipants,
                engagementRate: Math.round(engagementRate * 100) / 100,
                status: collaboration.status,
                createdAt: collaboration.createdAt,
                lastActivity: collaboration.updatedAt
            },
            activity: {
                recentActivity,
                monthlyActivity,
                avgResponseTime,
                peakActivityHours: calculatePeakHours(collaboration.activityFeed || []),
                activityTrend: calculateActivityTrend(collaboration.activityFeed || [])
            },
            performance: {
                completionRate: calculateCompletionRate(collaboration),
                qualityScore: calculateQualityScore(collaboration),
                collaborationEfficiency: calculateEfficiency(collaboration),
                milestoneProgress: calculateMilestoneProgress(collaboration)
            },
            participants: {
                growthTrend,
                topContributors: contributorStats.slice(0, 5),
                roleDistribution: calculateRoleDistribution(collaboration.participants),
                retentionRate: calculateRetentionRate(collaboration.participants)
            },
            content: {
                totalContributions: collaboration.analytics?.totalContributions || 0,
                avgRating: collaboration.analytics?.avgRating || 0,
                totalViews: collaboration.analytics?.totalViews || 0,
                shareCount: collaboration.analytics?.totalShares || 0
            }
        };

        res.json({
            success: true,
            insights,
            collaborationId: id
        });
    } catch (error) {
        console.error('Error getting collaboration insights:', error);
        res.status(500).json({ message: 'Error fetching insights', error: error.message });
    }
};

// Helper functions for insights calculations
function calculateAverageResponseTime(activityFeed) {
    if (!activityFeed || activityFeed.length < 2) return 0;
    
    let totalTime = 0;
    let count = 0;
    
    for (let i = 1; i < activityFeed.length; i++) {
        const timeDiff = new Date(activityFeed[i].timestamp) - new Date(activityFeed[i-1].timestamp);
        if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) { // Less than 24 hours
            totalTime += timeDiff;
            count++;
        }
    }
    
    return count > 0 ? Math.round(totalTime / count / (60 * 1000)) : 0; // Return in minutes
}

function calculateGrowthTrend(participants) {
    if (!participants || participants.length === 0) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentJoins = participants.filter(p => 
        p.joinedAt && p.joinedAt > weekAgo
    ).length;
    
    const totalParticipants = participants.length;
    return totalParticipants > 0 ? (recentJoins / totalParticipants) * 100 : 0;
}

function calculateContributorStats(activityFeed, participants) {
    const stats = {};
    
    // Initialize stats for all participants
    participants.forEach(p => {
        stats[p.user._id || p.user] = {
            userId: p.user._id || p.user,
            username: p.user.username || 'Unknown',
            avatar: p.user.profile?.avatar || null,
            contributions: 0,
            role: p.role
        };
    });
    
    // Count contributions from activity feed
    activityFeed.forEach(activity => {
        const userId = activity.user?._id || activity.user;
        if (stats[userId]) {
            stats[userId].contributions++;
        }
    });
    
    return Object.values(stats).sort((a, b) => b.contributions - a.contributions);
}

function calculatePeakHours(activityFeed) {
    if (!activityFeed || activityFeed.length === 0) return [];
    
    const hourCounts = new Array(24).fill(0);
    
    activityFeed.forEach(activity => {
        const hour = new Date(activity.timestamp).getHours();
        hourCounts[hour]++;
    });
    
    const maxCount = Math.max(...hourCounts);
    const peakHours = [];
    
    hourCounts.forEach((count, hour) => {
        if (count === maxCount && maxCount > 0) {
            peakHours.push(hour);
        }
    });
    
    return peakHours;
}

function calculateActivityTrend(activityFeed) {
    if (!activityFeed || activityFeed.length < 2) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = activityFeed.filter(a => a.timestamp > weekAgo).length;
    const lastWeek = activityFeed.filter(a => 
        a.timestamp > twoWeeksAgo && a.timestamp <= weekAgo
    ).length;
    
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return ((thisWeek - lastWeek) / lastWeek) * 100;
}

function calculateCompletionRate(collaboration) {
    // Placeholder - would need milestones/tasks to calculate properly
    if (collaboration.status === 'completed') return 100;
    if (collaboration.status === 'active') return Math.random() * 60 + 20; // 20-80%
    return 0;
}

function calculateQualityScore(collaboration) {
    // Based on ratings, reviews, etc.
    return collaboration.analytics?.avgRating || Math.random() * 3 + 2; // 2-5 range
}

function calculateEfficiency(collaboration) {
    // Placeholder calculation based on activity vs time
    const ageInDays = (new Date() - collaboration.createdAt) / (1000 * 60 * 60 * 24);
    const activityCount = collaboration.activityFeed?.length || 0;
    
    if (ageInDays === 0) return 0;
    return Math.min(100, (activityCount / ageInDays) * 10);
}

function calculateMilestoneProgress(collaboration) {
    // Placeholder - would need actual milestone data
    return {
        completed: Math.floor(Math.random() * 5),
        total: Math.floor(Math.random() * 8) + 5,
        percentage: Math.random() * 100
    };
}

function calculateRoleDistribution(participants) {
    const distribution = {};
    participants.forEach(p => {
        distribution[p.role] = (distribution[p.role] || 0) + 1;
    });
    return distribution;
}

function calculateRetentionRate(participants) {
    if (!participants || participants.length === 0) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeRecently = participants.filter(p => 
        p.lastActive && p.lastActive > weekAgo
    ).length;
    
    return (activeRecently / participants.length) * 100;
}

// Bulk operations for collaborations
const bulkOperations = async (req, res) => {
    try {
        const { operation, collaborationIds, data = {} } = req.body;
        const userId = req.user._id || req.user.userId;

        const results = [];

        for (const id of collaborationIds) {
            try {
                const collaboration = await Collaboration.findById(id);
                if (!collaboration) {
                    results.push({ id, success: false, error: 'Collaboration not found' });
                    continue;
                }

                // Check permissions
                if (!collaboration.isOwner(userId)) {
                    results.push({ id, success: false, error: 'Permission denied' });
                    continue;
                }

                switch (operation) {
                    case 'update_status':
                        collaboration.status = data.status;
                        await collaboration.save();
                        results.push({ id, success: true, message: 'Status updated' });
                        break;
                    
                    case 'update_settings':
                        Object.assign(collaboration.settings, data.settings);
                        await collaboration.save();
                        results.push({ id, success: true, message: 'Settings updated' });
                        break;
                    
                    case 'add_tags':
                        collaboration.tags = [...new Set([...collaboration.tags, ...data.tags])];
                        await collaboration.save();
                        results.push({ id, success: true, message: 'Tags added' });
                        break;
                    
                    case 'archive':
                        collaboration.status = 'completed';
                        collaboration.settings.isPublic = false;
                        await collaboration.save();
                        results.push({ id, success: true, message: 'Collaboration archived' });
                        break;
                    
                    default:
                        results.push({ id, success: false, error: 'Unknown operation' });
                }
            } catch (error) {
                results.push({ id, success: false, error: error.message });
            }
        }

        res.json({
            success: true,
            operation,
            results,
            summary: {
                total: collaborationIds.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        });
    } catch (error) {
        console.error('Error performing bulk operations:', error);
        res.status(500).json({ message: 'Error performing bulk operations', error: error.message });
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
    deleteCollaboration,
    removeCollaborator,
    acceptInvite,
    declineInvite,
    updateCollaboratorRole,
    getPendingInvites,
    // New advanced features
    mergeFork,
    getCollaborationTemplates,
    createFromTemplate,
    getCollaborationInsights,
    bulkOperations
};
