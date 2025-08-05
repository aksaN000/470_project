// 👥 Follow Controller (MVC - Controller Layer)
// This handles all follow-related HTTP requests and business logic

const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Follow a user
// @route   POST /api/follows/:userId
// @access  Private
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Check if trying to follow themselves
        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        // Check if user to follow exists
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: currentUserId,
            following: userId
        });

        if (existingFollow) {
            if (existingFollow.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'You are already following this user'
                });
            } else {
                // Refollow
                existingFollow.status = 'active';
                await existingFollow.save();
            }
        } else {
            // Create new follow relationship
            await Follow.create({
                follower: currentUserId,
                following: userId
            });
        }

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.followersCount': 1 }
        });

        await User.findByIdAndUpdate(currentUserId, {
            $inc: { 'stats.followingCount': 1 }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully followed user',
            data: {
                following: userToFollow.username,
                isFollowing: true
            }
        });

    } catch (error) {
        console.error('❌ Error following user:', error);
        res.status(500).json({
            success: false,
            message: 'Error following user',
            error: error.message
        });
    }
};

// @desc    Unfollow a user
// @route   DELETE /api/follows/:userId
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Find and update follow relationship
        const follow = await Follow.findOne({
            follower: currentUserId,
            following: userId,
            status: 'active'
        });

        if (!follow) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }

        // Update follow status
        follow.status = 'unfollowed';
        await follow.save();

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.followersCount': -1 }
        });

        await User.findByIdAndUpdate(currentUserId, {
            $inc: { 'stats.followingCount': -1 }
        });

        const userUnfollowed = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: 'Successfully unfollowed user',
            data: {
                unfollowed: userUnfollowed.username,
                isFollowing: false
            }
        });

    } catch (error) {
        console.error('❌ Error unfollowing user:', error);
        res.status(500).json({
            success: false,
            message: 'Error unfollowing user',
            error: error.message
        });
    }
};

// @desc    Get user's followers
// @route   GET /api/follows/:userId/followers
// @access  Public
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const followers = await Follow.getFollowers(userId, { 
            page: parseInt(page), 
            limit: parseInt(limit) 
        });

        const totalFollowers = await Follow.getFollowersCount(userId);

        res.status(200).json({
            success: true,
            data: {
                followers: followers.map(follow => ({
                    id: follow.follower._id,
                    username: follow.follower.username,
                    avatar: follow.follower.avatar,
                    stats: follow.follower.stats,
                    followedAt: follow.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalFollowers / limit),
                    totalCount: totalFollowers,
                    hasNext: page * limit < totalFollowers
                }
            },
            message: 'Followers fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting followers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching followers',
            error: error.message
        });
    }
};

// @desc    Get user's following
// @route   GET /api/follows/:userId/following
// @access  Public
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const following = await Follow.getFollowing(userId, { 
            page: parseInt(page), 
            limit: parseInt(limit) 
        });

        const totalFollowing = await Follow.getFollowingCount(userId);

        res.status(200).json({
            success: true,
            data: {
                following: following.map(follow => ({
                    id: follow.following._id,
                    username: follow.following.username,
                    avatar: follow.following.avatar,
                    stats: follow.following.stats,
                    followedAt: follow.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalFollowing / limit),
                    totalCount: totalFollowing,
                    hasNext: page * limit < totalFollowing
                }
            },
            message: 'Following list fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting following:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching following list',
            error: error.message
        });
    }
};

// @desc    Check if current user is following another user
// @route   GET /api/follows/:userId/status
// @access  Private
const getFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const isFollowing = await Follow.isFollowing(currentUserId, userId);

        res.status(200).json({
            success: true,
            data: {
                isFollowing,
                userId,
                currentUserId
            },
            message: 'Follow status fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting follow status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching follow status',
            error: error.message
        });
    }
};

// @desc    Get feed of memes from followed users
// @route   GET /api/follows/feed
// @access  Private
const getFollowingFeed = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { page = 1, limit = 12 } = req.query;

        // Get list of users current user is following
        const following = await Follow.find({
            follower: currentUserId,
            status: 'active'
        }).select('following');

        const followingIds = following.map(f => f.following);

        if (followingIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    memes: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalCount: 0,
                        hasNext: false
                    }
                },
                message: 'No followed users found'
            });
        }

        // Get memes from followed users
        const Meme = require('../models/Meme');
        
        const skip = (page - 1) * limit;
        const memes = await Meme.find({
            creator: { $in: followingIds },
            isPublic: true,
            visibility: { $in: ['public', 'followers_only', 'feed_only'] }
        })
        .populate('creator', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const totalMemes = await Meme.countDocuments({
            creator: { $in: followingIds },
            isPublic: true,
            visibility: { $in: ['public', 'followers_only', 'feed_only'] }
        });

        res.status(200).json({
            success: true,
            data: {
                memes: memes.map(meme => meme.getPublicData(currentUserId)),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalMemes / limit),
                    totalCount: totalMemes,
                    hasNext: page * limit < totalMemes
                }
            },
            message: 'Following feed fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting following feed:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching following feed',
            error: error.message
        });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus,
    getFollowingFeed
};
