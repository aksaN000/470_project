// 🎮 Meme Controller (MVC - Controller Layer)
// This handles all meme-related business logic and API operations

const Meme = require('../models/Meme');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

// ========================================
// MEME GALLERY & BROWSING
// ========================================

// @desc    Get all public memes with pagination and filtering
// @route   GET /api/memes
// @access  Public
const getAllMemes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category = 'all',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            tags
        } = req.query;

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortOrderNum = sortOrder === 'desc' ? -1 : 1;

        // Build search options
        const searchOptions = {
            category: category !== 'all' ? category : undefined,
            tags: tags ? tags.split(',') : undefined,
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder: sortOrderNum
        };

        // Get memes based on search query
        let memes;
        if (search) {
            memes = await Meme.searchMemes(search, searchOptions);
        } else {
            memes = await Meme.find({
                isPublic: true,
                isActive: true,
                ...(category !== 'all' && { category })
            })
            .sort({ [sortBy]: sortOrderNum })
            .limit(parseInt(limit))
            .skip(skip);
        }

        // Get total count for pagination
        const totalMemes = await Meme.countDocuments({
            isPublic: true,
            isActive: true,
            ...(category !== 'all' && { category })
        });

        const totalPages = Math.ceil(totalMemes / limit);

        res.json({
            success: true,
            data: {
                memes: memes.map(meme => meme.getPublicData()),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalMemes,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                filters: {
                    category,
                    sortBy,
                    sortOrder,
                    search,
                    tags
                }
            },
            message: `Found ${memes.length} memes`
        });

    } catch (error) {
        console.error('❌ Error getting memes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching memes',
            error: error.message
        });
    }
};

// @desc    Get trending memes
// @route   GET /api/memes/trending
// @access  Public
const getTrendingMemes = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const trendingMemes = await Meme.getTrending(parseInt(limit));

        res.json({
            success: true,
            data: {
                memes: trendingMemes.map(meme => meme.getPublicData()),
                count: trendingMemes.length
            },
            message: 'Trending memes fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting trending memes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending memes',
            error: error.message
        });
    }
};

// @desc    Get memes by category
// @route   GET /api/memes/category/:category
// @access  Public
const getMemesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;
        
        const skip = (page - 1) * limit;
        const memes = await Meme.getByCategory(category, parseInt(limit), skip);
        
        const totalMemes = await Meme.countDocuments({
            category,
            isPublic: true,
            isActive: true
        });

        res.json({
            success: true,
            data: {
                memes: memes.map(meme => meme.getPublicData()),
                category,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalMemes / limit),
                    totalMemes
                }
            },
            message: `Found ${memes.length} ${category} memes`
        });

    } catch (error) {
        console.error('❌ Error getting memes by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching memes by category',
            error: error.message
        });
    }
};

// ========================================
// INDIVIDUAL MEME OPERATIONS
// ========================================

// @desc    Get single meme by ID
// @route   GET /api/memes/:id
// @access  Public
const getMemeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const meme = await Meme.findById(id);
        
        if (!meme || !meme.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
            });
        }

        // Check if meme is private and user is not the creator
        if (!meme.isPublic && (!req.user || meme.creator._id.toString() !== req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'This meme is private'
            });
        }

        // Increment view count (only if not the creator)
        if (!req.user || meme.creator._id.toString() !== req.user._id.toString()) {
            await meme.incrementViews();
        }

        res.json({
            success: true,
            data: {
                meme: meme.getPublicData(),
                isLiked: req.user ? meme.isLikedBy(req.user._id) : false
            },
            message: 'Meme fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting meme:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meme',
            error: error.message
        });
    }
};

// ========================================
// MEME CREATION & UPLOAD
// ========================================

// @desc    Create/Upload new meme
// @route   POST /api/memes
// @access  Private
const createMeme = async (req, res) => {
    try {
        const {
            title,
            description = '',
            category = 'funny',
            tags = [],
            isPublic = true,
            imageUrl,
            thumbnailUrl = '',
            imageData = {},
            metadata = {},
            memeData = {}
        } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // For new image uploads, imageData should contain file information
        // For legacy imageUrl uploads, we still support the old format
        let finalImageUrl = imageUrl;
        let finalThumbnailUrl = thumbnailUrl;
        let finalImageData = imageData;

        // If imageData is provided (new upload system)
        if (imageData && imageData.fileId) {
            finalImageUrl = imageData.urls?.optimized || imageData.urls?.original || imageUrl;
            finalThumbnailUrl = imageData.urls?.thumbnail || thumbnailUrl;
        } else if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL or image data is required'
            });
        }

        // Create new meme
        const newMeme = new Meme({
            title: title.trim(),
            description: description.trim(),
            category,
            tags: Array.isArray(tags) ? tags : [],
            isPublic,
            imageUrl: finalImageUrl,
            thumbnailUrl: finalThumbnailUrl,
            imageData: finalImageData,
            creator: req.user._id,
            metadata,
            memeData
        });

        await newMeme.save();

        // Update user's meme count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.memesCreated': 1 }
        });

        // Populate creator info
        await newMeme.populate('creator', 'username profile.avatar');

        res.status(201).json({
            success: true,
            data: {
                meme: newMeme.getPublicData()
            },
            message: 'Meme created successfully! 🎉'
        });

    } catch (error) {
        console.error('Error creating meme:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error creating meme',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// ========================================
// MEME MANAGEMENT (CRUD)
// ========================================

// @desc    Update meme
// @route   PUT /api/memes/:id
// @access  Private (Only creator or admin)
const updateMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            category,
            tags,
            isPublic
        } = req.body;

        const meme = await Meme.findById(id);

        if (!meme || !meme.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
            });
        }

        // Check if user is the creator
        if (meme.creator._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this meme'
            });
        }

        // Update fields
        if (title) meme.title = title.trim();
        if (description !== undefined) meme.description = description.trim();
        if (category) meme.category = category;
        if (tags) meme.tags = Array.isArray(tags) ? tags : [];
        if (isPublic !== undefined) meme.isPublic = isPublic;

        await meme.save();

        res.json({
            success: true,
            data: {
                meme: meme.getPublicData()
            },
            message: 'Meme updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating meme:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating meme',
            error: error.message
        });
    }
};

// @desc    Delete meme (soft delete)
// @route   DELETE /api/memes/:id
// @access  Private (Only creator or admin)
const deleteMeme = async (req, res) => {
    try {
        const { id } = req.params;

        const meme = await Meme.findById(id);

        if (!meme || !meme.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
            });
        }

        // Check if user is the creator
        if (meme.creator._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this meme'
            });
        }

        // Soft delete
        meme.isActive = false;
        await meme.save();

        // Update user's meme count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.memesCreated': -1 }
        });

        res.json({
            success: true,
            message: 'Meme deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting meme:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting meme',
            error: error.message
        });
    }
};

// ========================================
// SOCIAL INTERACTIONS
// ========================================

// @desc    Like/Unlike meme
// @route   POST /api/memes/:id/like
// @access  Private
const toggleLikeMeme = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const meme = await Meme.findById(id);

        if (!meme || !meme.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
            });
        }

        if (!meme.isPublic && meme.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This meme is private'
            });
        }

        const isLiked = meme.isLikedBy(userId);

        if (isLiked) {
            await meme.removeLike(userId);
        } else {
            await meme.addLike(userId);
        }

        res.json({
            success: true,
            data: {
                isLiked: !isLiked,
                likesCount: meme.stats.likesCount
            },
            message: isLiked ? 'Meme unliked' : 'Meme liked'
        });

    } catch (error) {
        console.error('❌ Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating like status',
            error: error.message
        });
    }
};

// @desc    Share meme (increment share count)
// @route   POST /api/memes/:id/share
// @access  Public
const shareMeme = async (req, res) => {
    try {
        const { id } = req.params;

        const meme = await Meme.findById(id);

        if (!meme || !meme.isActive || !meme.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or not available for sharing'
            });
        }

        await meme.incrementShares();

        res.json({
            success: true,
            data: {
                shareUrl: `${process.env.CLIENT_URL}/meme/${meme._id}`,
                shares: meme.stats.shares
            },
            message: 'Meme shared successfully'
        });

    } catch (error) {
        console.error('❌ Error sharing meme:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing meme',
            error: error.message
        });
    }
};

// ========================================
// USER'S MEME COLLECTION
// ========================================

// @desc    Get current user's memes
// @route   GET /api/memes/my-memes
// @access  Private
const getMyMemes = async (req, res) => {
    try {
        const { includePrivate = 'true' } = req.query;
        
        const memes = await Meme.getUserMemes(
            req.user._id, 
            includePrivate === 'true'
        );

        res.json({
            success: true,
            data: {
                memes: memes.map(meme => ({
                    ...meme.getPublicData(),
                    isPublic: meme.isPublic // Include privacy status for own memes
                })),
                count: memes.length
            },
            message: 'Your memes fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting user memes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your memes',
            error: error.message
        });
    }
};

// @desc    Get memes by specific user
// @route   GET /api/memes/user/:userId
// @access  Public
const getUserMemes = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Only get public memes for other users
        const memes = await Meme.getUserMemes(userId, false);

        // Get user info
        const user = await User.findById(userId).select('username profile.avatar stats');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                memes: memes.map(meme => meme.getPublicData()),
                user: {
                    id: user._id,
                    username: user.username,
                    avatar: user.profile.avatar,
                    stats: user.stats
                },
                count: memes.length
            },
            message: `${user.username}'s memes fetched successfully`
        });

    } catch (error) {
        console.error('❌ Error getting user memes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user memes',
            error: error.message
        });
    }
};

// ========================================
// STATISTICS & ANALYTICS
// ========================================

// @desc    Get meme statistics
// @route   GET /api/memes/stats
// @access  Public
const getMemeStats = async (req, res) => {
    try {
        const totalMemes = await Meme.countDocuments({ isActive: true });
        const publicMemes = await Meme.countDocuments({ isActive: true, isPublic: true });
        
        const categoryStats = await Meme.aggregate([
            { $match: { isActive: true, isPublic: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const topCreators = await Meme.aggregate([
            { $match: { isActive: true, isPublic: true } },
            { $group: { _id: '$creator', memeCount: { $sum: 1 } } },
            { $sort: { memeCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            { $unwind: '$creator' },
            {
                $project: {
                    username: '$creator.username',
                    avatar: '$creator.profile.avatar',
                    memeCount: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                total: {
                    allMemes: totalMemes,
                    publicMemes: publicMemes
                },
                categories: categoryStats,
                topCreators
            },
            message: 'Meme statistics fetched successfully'
        });

    } catch (error) {
        console.error('❌ Error getting meme stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meme statistics',
            error: error.message
        });
    }
};

// @desc    Download meme
// @route   GET /api/memes/:id/download
// @access  Public
const downloadMeme = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the meme
        const meme = await Meme.findById(id);
        if (!meme) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found'
            });
        }

        // Check if meme is private and user doesn't have access
        if (meme.privacy === 'private') {
            if (!req.user || meme.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to private meme'
                });
            }
        }

        // Increment download count
        await Meme.findByIdAndUpdate(
            id,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        // Get the file path from the imageUrl
        const imageUrl = meme.imageUrl;
        let filePath;

        if (imageUrl.startsWith('http')) {
            // External URL - redirect to the image
            return res.redirect(imageUrl);
        } else {
            // Local file
            const path = require('path');
            filePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl));
        }

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Meme file not found'
            });
        }

        // Set headers for download
        const fileName = `meme-${meme._id}-${meme.title.replace(/[^a-zA-Z0-9]/g, '_')}.${path.extname(filePath).slice(1)}`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('❌ Error streaming file:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading meme'
            });
        });

    } catch (error) {
        console.error('❌ Error downloading meme:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading meme',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    // Gallery & Browsing
    getAllMemes,
    getTrendingMemes,
    getMemesByCategory,
    getMemeById,
    
    // CRUD Operations
    createMeme,
    updateMeme,
    deleteMeme,
    
    // Social Interactions
    toggleLikeMeme,
    shareMeme,
    
    // User Collections
    getMyMemes,
    getUserMemes,
    
    // Download
    downloadMeme,
    
    // Statistics
    getMemeStats
};
