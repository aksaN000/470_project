// 💬 Comment Controller (MVC - Controller Layer)
// Handles HTTP requests for comment operations

const Comment = require('../models/Comment');
const Meme = require('../models/Meme');
const User = require('../models/User');

// ========================================
// COMMENT CRUD OPERATIONS
// ========================================

// @desc    Get comments for a meme
// @route   GET /api/memes/:memeId/comments
// @access  Public
const getComments = async (req, res) => {
    try {
        const { memeId } = req.params;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const skip = (page - 1) * limit;
        const sortOrderValue = sortOrder === 'desc' ? -1 : 1;
        
        // Check if meme exists
        const meme = await Meme.findById(memeId);
        if (!meme || !meme.isActive || !meme.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or not accessible'
            });
        }
        
        // Get comments
        const comments = await Comment.getCommentsByMeme(memeId, {
            limit: parseInt(limit),
            skip,
            sortBy,
            sortOrder: sortOrderValue
        });
        
        console.log(`📋 Loading ${comments.length} comments for meme ${memeId}`);
        
        // Get total count for pagination
        const totalComments = await Comment.countDocuments({
            meme: memeId,
            isActive: true,
            parentComment: null
        });
        
        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.getReplies(comment._id, { limit: 3 });
                const totalReplies = await Comment.countDocuments({
                    parentComment: comment._id,
                    isActive: true
                });
                
                // Ensure we have proper method access by manually calling isLikedBy
                // TEMP: Fixed issue with comment.isLikedBy method
                let isLikedByUser = false;
                if (comment.likes && comment.likes.length > 0) {
                    console.log('🔍 Comment has likes:', comment._id, 'likes count:', comment.likes.length);
                    console.log('🔍 Likes structure:', comment.likes.map(like => ({ 
                        user: like?.user, 
                        hasUser: !!like?.user,
                        userString: like?.user?.toString ? like.user.toString() : 'no toString method'
                    })));
                }
                try {
                    isLikedByUser = req.user && comment.likes ? 
                        comment.likes.some(like => like && like.user && like.user.toString() === req.user._id.toString()) : 
                        false;
                } catch (error) {
                    console.error('❌ Error checking like status for comment:', comment._id, error.message);
                    console.error('Comment likes:', comment.likes);
                    isLikedByUser = false;
                }
                
                return {
                    ...comment.getPublicData(),
                    replies: replies.map(reply => reply.getPublicData()),
                    hasMoreReplies: totalReplies > 3,
                    totalReplies,
                    isLiked: isLikedByUser
                };
            })
        );
        
        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalComments / limit),
            totalComments,
            hasNextPage: page < Math.ceil(totalComments / limit),
            hasPrevPage: page > 1
        };
        
        res.json({
            success: true,
            data: {
                comments: commentsWithReplies,
                pagination
            },
            message: 'Comments fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error getting comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// @desc    Add new comment to meme
// @route   POST /api/memes/:memeId/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { memeId } = req.params;
        const { content, parentComment = null } = req.body;
        
        console.log('💬 Adding comment:', { memeId, content: content?.substring(0, 50), parentComment, userId: req.user._id });
        
        // Validation
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }
        
        if (content.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 500 characters'
            });
        }
        
        // Check if meme exists and is accessible
        const meme = await Meme.findById(memeId);
        if (!meme || !meme.isActive || !meme.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or not accessible'
            });
        }
        
        // If this is a reply, check if parent comment exists
        if (parentComment) {
            const parentCommentDoc = await Comment.findById(parentComment);
            if (!parentCommentDoc || !parentCommentDoc.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }
        
        // Create new comment
        const newComment = new Comment({
            content: content.trim(),
            meme: memeId,
            author: req.user._id,
            parentComment
        });
        
        await newComment.save();
        
        // Update meme's comment count
        await Meme.findByIdAndUpdate(memeId, {
            $inc: { 'stats.commentsCount': 1 }
        });
        
        // Update parent comment's reply count if this is a reply
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, {
                $inc: { 'stats.repliesCount': 1 }
            });
        }
        
        // Populate author info
        await newComment.populate('author', 'username profile.avatar');
        
        res.status(201).json({
            success: true,
            data: {
                comment: newComment.getPublicData()
            },
            message: 'Comment added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        
        // Validation
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }
        
        if (content.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 500 characters'
            });
        }
        
        // Find comment
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user is the author
        if (comment.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own comments'
            });
        }
        
        // Update comment
        comment.content = content.trim();
        await comment.save();
        
        res.json({
            success: true,
            data: {
                comment: comment.getPublicData()
            },
            message: 'Comment updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating comment',
            error: error.message
        });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find comment
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user is the author or admin
        if (comment.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }
        
        // Soft delete (mark as inactive)
        comment.isActive = false;
        await comment.save();
        
        // Update meme's comment count
        await Meme.findByIdAndUpdate(comment.meme, {
            $inc: { 'stats.commentsCount': -1 }
        });
        
        // Update parent comment's reply count if this is a reply
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $inc: { 'stats.repliesCount': -1 }
            });
        }
        
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// ========================================
// COMMENT INTERACTIONS
// ========================================

// @desc    Toggle like on comment
// @route   POST /api/comments/:id/like
// @access  Private
const toggleLikeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Find comment
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if already liked
        const isLiked = comment.likes && comment.likes.some(like => like && like.user && like.user.toString() === userId.toString());
        
        if (isLiked) {
            await comment.removeLike(userId);
        } else {
            await comment.addLike(userId);
        }
        
        res.json({
            success: true,
            data: {
                isLiked: !isLiked,
                likesCount: comment.stats.likesCount
            },
            message: isLiked ? 'Comment unliked' : 'Comment liked'
        });
        
    } catch (error) {
        console.error('❌ Error toggling comment like:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating like status',
            error: error.message
        });
    }
};

// @desc    Get replies to a comment
// @route   GET /api/comments/:id/replies
// @access  Public
const getReplies = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const skip = (page - 1) * limit;
        
        // Check if parent comment exists
        const parentComment = await Comment.findById(id);
        if (!parentComment || !parentComment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Get replies
        const replies = await Comment.getReplies(id, {
            limit: parseInt(limit),
            skip
        });
        
        // Get total count for pagination
        const totalReplies = await Comment.countDocuments({
            parentComment: id,
            isActive: true
        });
        
        const repliesWithLikeStatus = replies.map(reply => ({
            ...reply.getPublicData(),
            isLiked: req.user ? reply.likes && reply.likes.some(like => like && like.user && like.user.toString() === req.user._id.toString()) : false
        }));
        
        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReplies / limit),
            totalReplies,
            hasNextPage: page < Math.ceil(totalReplies / limit),
            hasPrevPage: page > 1
        };
        
        res.json({
            success: true,
            data: {
                replies: repliesWithLikeStatus,
                pagination
            },
            message: 'Replies fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error getting replies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching replies',
            error: error.message
        });
    }
};

// ========================================
// COMMENT REPORTING
// ========================================

// @desc    Report comment
// @route   POST /api/comments/:id/report
// @access  Private
const reportComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, description = '' } = req.body;
        
        // Validation
        const validReasons = ['spam', 'harassment', 'inappropriate', 'hate_speech', 'other'];
        if (!reason || !validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: 'Valid reason is required',
                validReasons
            });
        }
        
        // Find comment
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user already reported this comment
        const alreadyReported = comment.reports.some(report => 
            report.reporter.toString() === req.user._id.toString()
        );
        
        if (alreadyReported) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this comment'
            });
        }
        
        // Add report
        comment.reports.push({
            reporter: req.user._id,
            reason,
            description: description.trim()
        });
        
        comment.isReported = true;
        await comment.save();
        
        res.json({
            success: true,
            message: 'Comment reported successfully. Thank you for helping keep our community safe.'
        });
        
    } catch (error) {
        console.error('❌ Error reporting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error reporting comment',
            error: error.message
        });
    }
};

// ========================================
// USER COMMENTS
// ========================================

// @desc    Get user's comments
// @route   GET /api/users/:userId/comments
// @access  Public
const getUserComments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (page - 1) * limit;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user's comments
        const comments = await Comment.getUserComments(userId, {
            limit: parseInt(limit),
            skip
        });
        
        // Get total count for pagination
        const totalComments = await Comment.countDocuments({
            author: userId,
            isActive: true
        });
        
        const commentsWithLikeStatus = comments.map(comment => ({
            ...comment.getPublicData(),
            isLiked: req.user ? comment.likes && comment.likes.some(like => like && like.user && like.user.toString() === req.user._id.toString()) : false
        }));
        
        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalComments / limit),
            totalComments,
            hasNextPage: page < Math.ceil(totalComments / limit),
            hasPrevPage: page > 1
        };
        
        res.json({
            success: true,
            data: {
                comments: commentsWithLikeStatus,
                pagination,
                user: {
                    id: user._id,
                    username: user.username,
                    avatar: user.profile.avatar
                }
            },
            message: 'User comments fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error getting user comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user comments',
            error: error.message
        });
    }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
    // CRUD Operations
    getComments,
    addComment,
    updateComment,
    deleteComment,
    
    // Interactions
    toggleLikeComment,
    getReplies,
    
    // Reporting
    reportComment,
    
    // User Comments
    getUserComments
};
