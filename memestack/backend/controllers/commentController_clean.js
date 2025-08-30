const Comment = require('../models/Comment');
const Meme = require('../models/Meme');
const MemeTemplate = require('../models/MemeTemplate');
const Report = require('../models/Report');

// ========================================
// MEME COMMENT OPERATIONS
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
        
        // Get comments
        const comments = await Comment.find({
            meme: memeId,
            isActive: true,
            parentComment: null
        })
        .populate('author', 'username profile.avatar profile.displayName')
        .sort({ [sortBy]: sortOrderValue })
        .limit(parseInt(limit))
        .skip(skip);
        
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
                const replies = await Comment.find({
                    parentComment: comment._id,
                    isActive: true
                })
                .populate('author', 'username profile.avatar profile.displayName')
                .sort({ createdAt: 1 })
                .limit(5); // Limit replies shown initially
                
                return {
                    ...comment.getPublicData(),
                    replies: replies.map(reply => reply.getPublicData())
                };
            })
        );
        
        const pagination = {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalComments,
            total_pages: Math.ceil(totalComments / limit)
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

// @desc    Add new comment
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
        
        // Check if meme exists
        const meme = await Meme.findById(memeId);
        if (!meme) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
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
        await newComment.populate('author', 'username profile.avatar profile.displayName');
        
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
        const userId = req.user._id;
        
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
        
        // Find comment and check ownership
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }
        
        // Update comment
        comment.content = content.trim();
        comment.isEdited = true;
        comment.editedAt = new Date();
        
        await comment.save();
        await comment.populate('author', 'username profile.avatar profile.displayName');
        
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
        const userId = req.user._id;
        
        // Find comment
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user can delete (author or admin)
        const canDelete = comment.author.toString() === userId.toString() || req.user.role === 'admin';
        
        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }
        
        // Soft delete
        comment.isActive = false;
        comment.deletedAt = new Date();
        await comment.save();
        
        // Update meme's comment count
        if (comment.meme) {
            await Meme.findByIdAndUpdate(comment.meme, {
                $inc: { 'stats.commentsCount': -1 }
            });
        }
        
        // Update parent comment's reply count if this was a reply
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
        
        const replies = await Comment.find({
            parentComment: id,
            isActive: true
        })
        .populate('author', 'username profile.avatar profile.displayName')
        .sort({ createdAt: 1 })
        .limit(parseInt(limit))
        .skip(skip);
        
        const totalReplies = await Comment.countDocuments({
            parentComment: id,
            isActive: true
        });
        
        const pagination = {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalReplies,
            total_pages: Math.ceil(totalReplies / limit)
        };
        
        res.json({
            success: true,
            data: {
                replies: replies.map(reply => reply.getPublicData()),
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

// @desc    Report a comment
// @route   POST /api/comments/:id/report
// @access  Private
const reportComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, description = '' } = req.body;
        const userId = req.user._id;
        
        // Validation
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Report reason is required'
            });
        }
        
        // Check if comment exists
        const comment = await Comment.findById(id);
        if (!comment || !comment.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user already reported this comment
        const existingReport = await Report.findOne({
            reportedBy: userId,
            contentType: 'comment',
            contentId: id,
            status: { $in: ['pending', 'under_review'] }
        });
        
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this comment'
            });
        }
        
        // Create report
        const report = new Report({
            contentType: 'comment',
            contentId: id,
            reportedBy: userId,
            reason,
            description: description.trim()
        });
        
        await report.save();
        
        res.status(201).json({
            success: true,
            data: { reportId: report._id },
            message: 'Comment reported successfully'
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

// @desc    Get user's comments
// @route   GET /api/users/:userId/comments
// @access  Public
const getUserComments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (page - 1) * limit;
        
        const comments = await Comment.find({
            author: userId,
            isActive: true
        })
        .populate('author', 'username profile.avatar profile.displayName')
        .populate('meme', 'title imageUrl')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        
        const totalComments = await Comment.countDocuments({
            author: userId,
            isActive: true
        });
        
        const pagination = {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalComments,
            total_pages: Math.ceil(totalComments / limit)
        };
        
        res.json({
            success: true,
            data: {
                comments: comments.map(comment => comment.getPublicData()),
                pagination
            },
            message: 'Comments fetched successfully'
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
// TEMPLATE COMMENT OPERATIONS
// ========================================

// @desc    Get comments for a template
// @route   GET /api/templates/:templateId/comments
// @access  Public
const getTemplateComments = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const skip = (page - 1) * limit;
        const sortOrderValue = sortOrder === 'desc' ? -1 : 1;
        
        // Check if template exists
        const template = await MemeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        // Get comments
        const comments = await Comment.find({
            template: templateId,
            contentType: 'template',
            isActive: true,
            parentComment: null
        })
        .populate('author', 'username profile.avatar profile.displayName')
        .sort({ [sortBy]: sortOrderValue })
        .limit(parseInt(limit))
        .skip(skip);
        
        console.log(`📋 Loading ${comments.length} comments for template ${templateId}`);
        
        // Get total count for pagination
        const totalComments = await Comment.countDocuments({
            template: templateId,
            contentType: 'template',
            isActive: true,
            parentComment: null
        });
        
        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({
                    parentComment: comment._id,
                    isActive: true
                })
                .populate('author', 'username profile.avatar profile.displayName')
                .sort({ createdAt: 1 })
                .limit(5); // Limit replies shown initially
                
                return {
                    ...comment.getPublicData(),
                    replies: replies.map(reply => reply.getPublicData())
                };
            })
        );
        
        const pagination = {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: totalComments,
            total_pages: Math.ceil(totalComments / limit)
        };
        
        res.json({
            success: true,
            data: {
                comments: commentsWithReplies,
                pagination
            },
            message: 'Template comments fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error getting template comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template comments',
            error: error.message
        });
    }
};

// @desc    Add new comment to template
// @route   POST /api/templates/:templateId/comments
// @access  Private
const addTemplateComment = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { content, parentComment = null } = req.body;
        
        console.log('💬 Adding template comment:', { templateId, content: content?.substring(0, 50), parentComment, userId: req.user._id });
        
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
        
        // Check if template exists
        const template = await MemeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
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
            template: templateId,
            contentType: 'template',
            contentId: templateId,
            author: req.user._id,
            parentComment
        });
        
        await newComment.save();
        
        // Update template's comment count if it has one
        await MemeTemplate.findByIdAndUpdate(templateId, {
            $inc: { 'stats.commentsCount': 1 }
        });
        
        // Update parent comment's reply count if this is a reply
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, {
                $inc: { 'stats.repliesCount': 1 }
            });
        }
        
        // Populate author info
        await newComment.populate('author', 'username profile.avatar profile.displayName');
        
        res.status(201).json({
            success: true,
            data: {
                comment: newComment.getPublicData()
            },
            message: 'Template comment added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding template comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding template comment',
            error: error.message
        });
    }
};

module.exports = {
    // Meme Comments
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
    getUserComments,
    
    // Template Comments
    getTemplateComments,
    addTemplateComment
};
