// 👤 User Controller (MVC - Controller Layer)
// This handles all user-related HTTP requests

const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all users for browsing/discovery
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const sortOrderNum = sortOrder === 'desc' ? -1 : 1;

        // Build search query
        let query = { isActive: true };
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { 'profile.bio': { $regex: search, $options: 'i' } }
            ];
        }

        // Get users
        const users = await User.find(query)
            .select('username profile.bio profile.avatar profile.displayName stats createdAt')
            .sort({ [sortBy]: sortOrderNum })
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    username: user.username,
                    displayName: user.profile?.displayName || '',
                    bio: user.profile?.bio || '',
                    avatar: user.profile?.avatar || '',
                    stats: user.stats,
                    joinDate: user.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalUsers,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            },
            message: 'Users fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(id)
            .select('username profile stats createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    displayName: user.profile?.displayName || '',
                    bio: user.profile?.bio || '',
                    avatar: user.profile?.avatar || '',
                    stats: user.stats,
                    joinDate: user.createdAt
                }
            },
            message: 'User profile fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting user by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    getUserById
};
