// 👥 Group Controller
// Handles all community group related operations

const Group = require('../models/Group');
const User = require('../models/User');
const Meme = require('../models/Meme');
const mongoose = require('mongoose');

// Get all groups with filtering and pagination
const getGroups = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            sort = 'popular',
            search
        } = req.query;

        // Build filter object
        const filter = { 
            privacy: 'public',
            visibility: 'listed'
        };
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'popular':
                sortObj = { 'stats.memberCount': -1, 'stats.weeklyActiveMembers': -1 };
                break;
            case 'newest':
                sortObj = { createdAt: -1 };
                break;
            case 'active':
                sortObj = { 'stats.weeklyActiveMembers': -1, updatedAt: -1 };
                break;
            case 'featured':
                sortObj = { featured: -1, 'stats.memberCount': -1 };
                break;
            default:
                sortObj = { 'stats.memberCount': -1 };
                break;
        }

        const groups = await Group.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Group.countDocuments(filter);

        res.json({
            groups,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get group by slug
const getGroupBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user?.id;
        
        const group = await Group.findOne({ slug })
            .populate('creator', 'username profile.displayName profile.avatar stats.totalMemes')
            .populate('members.user', 'username profile.displayName profile.avatar stats.totalMemes')
            .populate('pendingMembers.user', 'username profile.displayName profile.avatar');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user can view this group
        if (group.privacy === 'private' && userId) {
            const isMember = group.members.some(member => 
                member.user._id.toString() === userId
            );
            if (!isMember) {
                return res.status(403).json({ message: 'This group is private' });
            }
        }

        // Increment view count
        group.stats.totalViews++;
        await group.save();

        // Get recent memes from this group
        const recentMemes = await Meme.find({ group: group._id })
            .populate('creator', 'username profile.displayName profile.avatar')
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();

        const response = {
            ...group.toJSON(),
            recentMemes,
            userRole: userId ? group.getUserRole(userId) : null,
            isMember: userId ? group.isMember(userId) : false
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

// Create new group
const createGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            description,
            longDescription,
            category,
            privacy,
            visibility,
            membershipType,
            rules,
            settings,
            tags,
            socialLinks
        } = req.body;

        // Check if group name is unique
        const existingGroup = await Group.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }

        const group = new Group({
            name,
            description,
            longDescription,
            creator: userId,
            category: category || 'general',
            privacy: privacy || 'public',
            visibility: visibility || 'listed',
            membershipType: membershipType || 'open',
            rules: Array.isArray(rules) ? rules : [],
            settings: settings || {},
            tags: Array.isArray(tags) ? tags : [],
            socialLinks: socialLinks || {},
            members: [{
                user: userId,
                role: 'owner',
                permissions: [
                    'manage_posts', 'manage_members', 'manage_settings',
                    'ban_members', 'delete_posts', 'pin_posts',
                    'create_challenges', 'manage_challenges'
                ]
            }]
        });

        await group.save();
        
        // Populate created group
        const populatedGroup = await Group.findById(group._id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar');

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

// Update group
const updateGroup = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions
        const userRole = group.getUserRole(userId);
        if (!['owner', 'admin'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        // Prevent changing sensitive fields
        delete updates.creator;
        delete updates.members;
        delete updates.slug;
        delete updates.stats;

        Object.assign(group, updates);
        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar');

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Error updating group', error: error.message });
    }
};

// Join group
const joinGroup = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const { message } = req.body;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.isMember(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if group requires approval
        if (group.membershipType === 'approval_required') {
            // Add to pending members
            const existingRequest = group.pendingMembers.find(pm => 
                pm.user.toString() === userId
            );
            
            if (existingRequest) {
                return res.status(400).json({ message: 'You already have a pending request' });
            }

            group.pendingMembers.push({ user: userId, message });
            await group.save();
            
            return res.json({ message: 'Membership request sent for approval' });
        } else if (group.membershipType === 'invite_only') {
            return res.status(403).json({ message: 'This group is invite-only' });
        } else {
            // Open membership
            await group.addMember(userId);
            return res.json({ message: 'Successfully joined group' });
        }
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(400).json({ message: error.message });
    }
};

// Leave group
const leaveGroup = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.creator.toString() === userId) {
            return res.status(400).json({ message: 'Group owner cannot leave. Transfer ownership first.' });
        }

        await group.removeMember(userId);
        res.json({ message: 'Successfully left group' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(400).json({ message: error.message });
    }
};

// Manage membership (approve/reject/ban)
const manageMembership = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userId: targetUserId, action, reason } = req.body;
        const userId = req.user.id;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions
        const userRole = group.getUserRole(userId);
        if (!['owner', 'admin', 'moderator'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to manage memberships' });
        }

        switch (action) {
            case 'approve':
                // Approve pending member
                const pendingIndex = group.pendingMembers.findIndex(pm => 
                    pm.user.toString() === targetUserId
                );
                if (pendingIndex === -1) {
                    return res.status(404).json({ message: 'Pending request not found' });
                }
                
                group.pendingMembers.splice(pendingIndex, 1);
                await group.addMember(targetUserId);
                break;

            case 'reject':
                // Reject pending member
                const rejectIndex = group.pendingMembers.findIndex(pm => 
                    pm.user.toString() === targetUserId
                );
                if (rejectIndex === -1) {
                    return res.status(404).json({ message: 'Pending request not found' });
                }
                
                group.pendingMembers.splice(rejectIndex, 1);
                await group.save();
                break;

            case 'ban':
                // Ban member
                await group.banMember(targetUserId, userId, reason);
                break;

            case 'remove':
                // Remove member
                await group.removeMember(targetUserId);
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        res.json({ message: `Successfully ${action}ed user` });
    } catch (error) {
        console.error('Error managing membership:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update member role
const updateMemberRole = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userId: targetUserId, role } = req.body;
        const userId = req.user.id;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions
        const userRole = group.getUserRole(userId);
        if (userRole !== 'owner') {
            return res.status(403).json({ message: 'Only group owner can change roles' });
        }

        await group.updateMemberRole(targetUserId, role, userId);
        res.json({ message: 'Member role updated successfully' });
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get trending groups
const getTrendingGroups = async (req, res) => {
    try {
        const groups = await Group.getTrending();
        res.json(groups);
    } catch (error) {
        console.error('Error getting trending groups:', error);
        res.status(500).json({ message: 'Error fetching trending groups', error: error.message });
    }
};

// Get user's groups
const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'all' } = req.query;

        let filter = {};
        switch (type) {
            case 'created':
                filter = { creator: userId };
                break;
            case 'joined':
                filter = { 'members.user': userId };
                break;
            case 'moderated':
                filter = { 
                    'members': { 
                        $elemMatch: { 
                            user: userId, 
                            role: { $in: ['moderator', 'admin', 'owner'] } 
                        } 
                    } 
                };
                break;
            case 'all':
            default:
                filter = {
                    $or: [
                        { creator: userId },
                        { 'members.user': userId }
                    ]
                };
                break;
        }

        const groups = await Group.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .sort({ updatedAt: -1 });

        // Add user role to each group
        const groupsWithRole = groups.map(group => ({
            ...group.toJSON(),
            userRole: group.getUserRole(userId)
        }));

        res.json(groupsWithRole);
    } catch (error) {
        console.error('Error getting user groups:', error);
        res.status(500).json({ message: 'Error fetching user groups', error: error.message });
    }
};

// Search groups
const searchGroups = async (req, res) => {
    try {
        const { query, category } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const groups = await Group.searchGroups(query.trim(), category);
        res.json(groups);
    } catch (error) {
        console.error('Error searching groups:', error);
        res.status(500).json({ message: 'Error searching groups', error: error.message });
    }
};

// Delete group
const deleteGroup = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ slug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions
        if (group.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only group owner can delete the group' });
        }

        // Check if group has content
        const memeCount = await Meme.countDocuments({ group: group._id });
        if (memeCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete group with existing content. Archive the group instead.' 
            });
        }

        await Group.findByIdAndDelete(group._id);
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Error deleting group', error: error.message });
    }
};

module.exports = {
    getGroups,
    getGroupBySlug,
    createGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
    manageMembership,
    updateMemberRole,
    getTrendingGroups,
    getUserGroups,
    searchGroups,
    deleteGroup
};
