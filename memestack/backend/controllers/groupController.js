// 👥 Group Controller
// Handles all community group related operations for the memestack

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
            isActive: true
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
                sortObj = { 'stats.memberCount': -1, 'stats.totalLikes': -1 };
                break;
            case 'newest':
                sortObj = { createdAt: -1 };
                break;
            case 'active':
                sortObj = { lastActivity: -1 };
                break;
            case 'memes':
                sortObj = { 'stats.memeCount': -1 };
                break;
            default:
                sortObj = { 'stats.memberCount': -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const groups = await Group.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Group.countDocuments(filter);

        res.json({
            groups,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get trending groups
const getTrendingGroups = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const groups = await Group.find({
            privacy: 'public',
            isActive: true
        })
        .populate('creator', 'username profile.displayName profile.avatar')
        .sort({ 
            'stats.memberCount': -1, 
            lastActivity: -1,
            'stats.memeCount': -1 
        })
        .limit(parseInt(limit))
        .lean();

        res.json(groups);
    } catch (error) {
        console.error('Error fetching trending groups:', error);
        res.status(500).json({ message: 'Error fetching trending groups', error: error.message });
    }
};

// Get group by slug
const getGroupBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const group = await Group.findBySlug(slug)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar')
            .populate('pendingMembers.user', 'username profile.displayName profile.avatar');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user can view this group
        if (group.privacy === 'private') {
            const userId = req.user?.id;
            if (!userId || !group.isMember(userId)) {
                return res.status(403).json({ message: 'This group is private' });
            }
        }

        res.json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

// Create new group
const createGroup = async (req, res) => {
    try {
        console.log('🧪 [createGroup] ENTER function (v2 diagnostics)');
        console.log('🧪 [createGroup] Incoming headers.authorization =', req.headers.authorization);
        console.log('🧪 [createGroup] req.user BEFORE resolution =', req.user);

        // Robust user id resolution
        let userId = (req.user && (req.user.userId || req.user._id || req.user.id)) || null;

        // Fallback: decode JWT directly if auth middleware somehow skipped (shouldn't happen after router.use(auth))
        if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId || decoded.id || decoded._id || null;
                console.log('🧪 [createGroup] Fallback decoded token userId =', userId);
            } catch (decodeErr) {
                console.warn('⚠️ [createGroup] JWT fallback decode failed:', decodeErr.message);
            }
        }
        const { name, description, longDescription, category, privacy, membershipType, rules, tags, avatar, banner } = req.body;

        console.log('📦 [createGroup] req.user =', req.user);
        console.log('📦 [createGroup] body =', req.body);

        if (!userId) {
            console.warn('⚠️ [createGroup] STILL no userId after fallback. req.user =', req.user);
            return res.status(401).json({ message: 'Unauthorized: user not resolved' });
        }
        console.log('🧪 [createGroup] Resolved userId =', userId);

        // Check if group name is unique
        const existingGroup = await Group.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }

        // Basic inline validation (mirrors express-validator) to avoid generic 500s
        if (!name || name.trim().length < 3 || name.trim().length > 100) {
            return res.status(400).json({ message: 'Group name must be between 3 and 100 characters' });
        }
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
            return res.status(400).json({ message: 'Group name has invalid characters' });
        }
        if (!description || description.trim().length < 10 || description.trim().length > 500) {
            return res.status(400).json({ message: 'Description must be between 10 and 500 characters' });
        }

        // Create the group
        const group = new Group({
            name,
            description,
            longDescription,
            creator: userId,
            category: category || 'general',
            privacy: privacy || 'public',
            membershipType: membershipType || 'open',
            rules: Array.isArray(rules) ? rules : [],
            tags: Array.isArray(tags) ? tags : [],
            avatar: avatar || null,
            banner: banner || null,
            members: [{
                user: userId,
                role: 'owner',
                permissions: [
                    // map to existing enum capabilities in schema where possible
                    'manage_posts','manage_members','manage_settings','create_challenges','manage_challenges'
                ]
            }],
            stats: { memberCount: 1 }
        });

        // Force-generate slug if somehow missing
        if (!group.slug) {
            group.slug = (name || '')
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

    console.log('🛠️ [createGroup] Pre-save group doc:', { slug: group.slug, creator: group.creator, firstMember: group.members?.[0] });

    await group.save();
    console.log('✅ [createGroup] Saved group _id:', group._id);
        
        // Populate created group
        const populatedGroup = await Group.findById(group._id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar');

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('❌ Error creating group:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Group name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.values(error.errors).map(e => e.message),
                raw: error.message
            });
        }
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

// Update group
const updateGroup = async (req, res) => {
    try {
        const { slug } = req.params;
    const userId = req.user?.userId || req.user?._id;
        const updates = req.body;

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions - only owner and admins can update
        const userRole = group.getMemberRole(userId);
        if (!['owner', 'admin'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        // Restrict certain fields from being updated
        const allowedUpdates = [
            'description', 'longDescription', 'category', 'privacy', 
            'membershipType', 'rules', 'tags', 'avatar', 'banner'
        ];
        
        const filteredUpdates = {};
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        // Apply updates
        Object.assign(group, filteredUpdates);
        await group.save();

        // Return updated group
        const updatedGroup = await Group.findById(group._id)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar');

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Error updating group', error: error.message });
    }
};

// Join a group
const joinGroup = async (req, res) => {
    try {
        const { slug } = req.params;
    const userId = req.user?.userId || req.user?._id;
        const { message } = req.body;

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.isMember(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check membership type
        if (group.membershipType === 'approval_required') {
            // Add to pending members
            if (group.hasPendingRequest(userId)) {
                return res.status(400).json({ message: 'You already have a pending request' });
            }

            group.pendingMembers.push({ 
                user: userId, 
                requestMessage: message || '' 
            });
            await group.save();
            
            return res.json({ message: 'Membership request sent for approval' });
        } else if (group.membershipType === 'invite_only') {
            return res.status(403).json({ message: 'This group is invite-only' });
        } else {
            // Open membership
            group.members.push({
                user: userId,
                role: 'member',
                permissions: ['create_memes', 'comment', 'like', 'share']
            });
            await group.save();
            
            return res.json({ message: 'Successfully joined the group' });
        }
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ message: 'Error joining group', error: error.message });
    }
};

// Leave a group
const leaveGroup = async (req, res) => {
    try {
        const { slug } = req.params;
    const userId = req.user?.userId || req.user?._id;

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.isMember(userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }

        // Check if user is the owner
        const userRole = group.getMemberRole(userId);
        if (userRole === 'owner') {
            return res.status(400).json({ 
                message: 'Group owner cannot leave. Transfer ownership or delete the group.' 
            });
        }

        // Remove member
        group.members = group.members.filter(member => 
            member.user.toString() !== userId.toString()
        );
        
        await group.save();
        res.json({ message: 'Successfully left the group' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Error leaving group', error: error.message });
    }
};

// Manage membership (approve/reject requests, remove members)
const manageMembership = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userId: targetUserId, action, reason } = req.body;
    const userId = req.user?.userId || req.user?._id;

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions
        const userRole = group.getMemberRole(userId);
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

                // Remove from pending and add to members
                group.pendingMembers.splice(pendingIndex, 1);
                group.members.push({
                    user: targetUserId,
                    role: 'member',
                    permissions: ['create_memes', 'comment', 'like', 'share']
                });
                break;

            case 'reject':
                // Reject pending member
                group.pendingMembers = group.pendingMembers.filter(pm => 
                    pm.user.toString() !== targetUserId
                );
                break;

            case 'remove':
                // Remove existing member
                const targetRole = group.getMemberRole(targetUserId);
                
                // Prevent removal of owner or higher-ranked members
                if (targetRole === 'owner') {
                    return res.status(400).json({ message: 'Cannot remove group owner' });
                }
                
                const roleHierarchy = { member: 1, moderator: 2, admin: 3, owner: 4 };
                if (roleHierarchy[targetRole] >= roleHierarchy[userRole]) {
                    return res.status(403).json({ message: 'Cannot remove member with equal or higher role' });
                }

                group.members = group.members.filter(member => 
                    member.user.toString() !== targetUserId
                );
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        await group.save();
        
        // Return updated group
        const updatedGroup = await Group.findById(group._id)
            .populate('members.user', 'username profile.displayName profile.avatar')
            .populate('pendingMembers.user', 'username profile.displayName profile.avatar');

        res.json({ 
            message: `Successfully ${action}ed member`,
            group: updatedGroup
        });
    } catch (error) {
        console.error('Error managing membership:', error);
        res.status(500).json({ message: 'Error managing membership', error: error.message });
    }
};

// Update member role
const updateMemberRole = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userId: targetUserId, role } = req.body;
    const userId = req.user?.userId || req.user?._id;

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions - only owner and admins can change roles
        const userRole = group.getMemberRole(userId);
        if (!['owner', 'admin'].includes(userRole)) {
            return res.status(403).json({ message: 'Not authorized to change member roles' });
        }

        // Find target member
        const memberIndex = group.members.findIndex(member => 
            member.user.toString() === targetUserId
        );
        
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const targetMember = group.members[memberIndex];
        
        // Prevent role changes that would create conflicts
        if (targetMember.role === 'owner') {
            return res.status(400).json({ message: 'Cannot change owner role' });
        }
        
        if (role === 'owner' && userRole !== 'owner') {
            return res.status(403).json({ message: 'Only owner can assign owner role' });
        }

        // Update role and permissions
        targetMember.role = role;
        
        // Set default permissions based on role
        switch (role) {
            case 'moderator':
                targetMember.permissions = [
                    'create_memes', 'comment', 'like', 'share',
                    'moderate_content'
                ];
                break;
            case 'admin':
                targetMember.permissions = [
                    'create_memes', 'comment', 'like', 'share',
                    'create_challenges', 'moderate_content', 
                    'manage_members'
                ];
                break;
            case 'member':
            default:
                targetMember.permissions = ['create_memes', 'comment', 'like', 'share'];
                break;
        }

        await group.save();
        
        res.json({ message: 'Member role updated successfully' });
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(500).json({ message: 'Error updating member role', error: error.message });
    }
};

// Get user's groups
const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'all' } = req.query;

        let filter = { 'members.user': userId };
        
        if (type === 'owned') {
            filter = { creator: userId };
        } else if (type === 'member') {
            filter = { 'members.user': userId, creator: { $ne: userId } };
        }

        const groups = await Group.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('members.user', 'username profile.displayName profile.avatar')
            .sort({ lastActivity: -1 });

        res.json(groups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ message: 'Error fetching user groups', error: error.message });
    }
};

// Search groups
const searchGroups = async (req, res) => {
    try {
        const { q, category, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const filter = {
            privacy: 'public',
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        if (category) {
            filter.category = category;
        }

        const groups = await Group.find(filter)
            .populate('creator', 'username profile.displayName profile.avatar')
            .sort({ 'stats.memberCount': -1 })
            .limit(parseInt(limit))
            .lean();

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

        const group = await Group.findBySlug(slug);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check permissions - only owner can delete
        if (group.creator.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only group owner can delete the group' });
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
    getTrendingGroups,
    getGroupBySlug,
    createGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
    manageMembership,
    updateMemberRole,
    getUserGroups,
    searchGroups,
    deleteGroup,
    __version: 'groupController-v3'
};
