const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const Meme = require('../models/Meme');

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
    try {
        console.log('🟦 Folder creation request received');
        console.log('🟦 Request body:', req.body);
        console.log('🟦 User ID:', req.user?._id);
        console.log('🟦 Full user object:', req.user);
        
        const { name, description, color, icon, isPrivate } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            console.log('🟥 Validation failed: name is required');
            return res.status(400).json({
                success: false,
                message: 'Folder name is required'
            });
        }

        if (name.length > 50) {
            console.log('🟥 Validation failed: name too long');
            return res.status(400).json({
                success: false,
                message: 'Folder name must be 50 characters or less'
            });
        }

        // Check if folder name already exists for this user
        console.log('🟦 Checking for existing folder with name:', name.trim());
        const existingFolder = await Folder.findOne({
            owner: req.user._id,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } // Case-insensitive
        });

        if (existingFolder) {
            console.log('🟥 Folder already exists');
            return res.status(400).json({
                success: false,
                message: 'A folder with this name already exists'
            });
        }

        console.log('🟦 Creating new folder...');
        const folder = new Folder({
            name: name.trim(),
            description: description || '',
            color: color || '#6366f1',
            icon: icon || 'folder',
            isPrivate: isPrivate !== undefined ? isPrivate : true,
            owner: req.user._id
        });

        console.log('🟦 Saving folder to database...');
        await folder.save();
        console.log('🟩 Folder created successfully:', folder._id);

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            folder
        });
    } catch (error) {
        console.error('🟥 Folder creation error:', error);
        console.error('🟥 Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get user's folders
// @route   GET /api/folders
// @access  Private
const getUserFolders = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const folders = await Folder.findUserFolders(req.user._id, {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder
        });

        const totalFolders = await Folder.countDocuments({ owner: req.user._id });
        const totalPages = Math.ceil(totalFolders / limit);

        res.json({
            success: true,
            folders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalFolders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single folder
// @route   GET /api/folders/:id
// @access  Private
const getFolder = async (req, res) => {
    try {
        const folderId = typeof req.params.id === 'string' ? new mongoose.Types.ObjectId(req.params.id) : req.params.id;
        
        const folder = await Folder.findOne({
            _id: folderId,
            owner: req.user._id
        }).populate({
            path: 'memes',
            select: 'title description imageUrl category createdAt stats tags',
            options: { sort: { createdAt: -1 } }
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        res.json({
            success: true,
            folder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res) => {
    try {
        const { name, description, color, icon, isPrivate } = req.body;

        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Check if new name conflicts with existing folders
        if (name && name !== folder.name) {
            const existingFolder = await Folder.findOne({
                owner: req.user._id,
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });

            if (existingFolder) {
                return res.status(400).json({
                    success: false,
                    message: 'A folder with this name already exists'
                });
            }
        }

        // Update fields
        if (name) folder.name = name;
        if (description !== undefined) folder.description = description;
        if (color) folder.color = color;
        if (icon) folder.icon = icon;
        if (isPrivate !== undefined) folder.isPrivate = isPrivate;

        await folder.save();

        res.json({
            success: true,
            message: 'Folder updated successfully',
            folder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        await Folder.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Folder deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Add meme to folder
// @route   POST /api/folders/:id/memes/:memeId
// @access  Private
const addMemeToFolder = async (req, res) => {
    try {
        const { id: folderId, memeId } = req.params;

        const folder = await Folder.findOne({
            _id: folderId,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Check if meme exists and belongs to user
        const memeObjectId = typeof memeId === 'string' ? new mongoose.Types.ObjectId(memeId) : memeId;
        const meme = await Meme.findOne({
            _id: memeObjectId,
            creator: req.user._id
        });

        if (!meme) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or you do not have permission'
            });
        }

        // Check if meme is already in folder
        const isAlreadyInFolder = folder.memes.some(existingId => existingId.equals(memeObjectId));
        if (isAlreadyInFolder) {
            return res.status(400).json({
                success: false,
                message: 'Meme is already in this folder'
            });
        }

        await folder.addMeme(memeObjectId);

        res.json({
            success: true,
            message: 'Meme added to folder successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Remove meme from folder
// @route   DELETE /api/folders/:id/memes/:memeId
// @access  Private
const removeMemeFromFolder = async (req, res) => {
    try {
        const { id: folderId, memeId } = req.params;

        const folder = await Folder.findOne({
            _id: folderId,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        await folder.removeMeme(memeId);

        res.json({
            success: true,
            message: 'Meme removed from folder successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Bulk add memes to folder
// @route   POST /api/folders/:id/memes/bulk
// @access  Private
const bulkAddMemesToFolder = async (req, res) => {
    try {
        console.log('🗂️ BULK ADD MEMES - Starting request');
        const { memeIds } = req.body;
        const folderId = req.params.id;

        console.log('🗂️ BULK ADD MEMES - Raw request body:', req.body);
        console.log('🗂️ BULK ADD MEMES - Folder ID:', folderId);
        console.log('🗂️ BULK ADD MEMES - User ID:', req.user._id);
        console.log('🗂️ BULK ADD MEMES - Meme IDs:', memeIds);

        if (!Array.isArray(memeIds) || memeIds.length === 0) {
            console.log('❌ BULK ADD MEMES - Invalid meme IDs array');
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of meme IDs'
            });
        }

        console.log('🗂️ BULK ADD MEMES - Finding folder...');
        const folder = await Folder.findOne({
            _id: folderId,
            owner: req.user._id
        });

        if (!folder) {
            console.log('❌ BULK ADD MEMES - Folder not found');
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        console.log('🗂️ BULK ADD MEMES - Folder found:', folder.name);

        // Verify all memes belong to user
        console.log('🗂️ BULK ADD MEMES - Searching for memes with creator field...');
        
        // Ensure memeIds are ObjectIds
        const objectIdMemeIds = memeIds.map(id => {
            if (typeof id === 'string') {
                return new mongoose.Types.ObjectId(id);
            }
            return id;
        });
        
        const memes = await Meme.find({
            _id: { $in: objectIdMemeIds },
            creator: req.user._id
        });

        console.log('🗂️ BULK ADD MEMES - Found memes:', memes.length, 'out of', memeIds.length);
        console.log('🗂️ BULK ADD MEMES - Meme details:', memes.map(m => ({ id: m._id, title: m.title, creator: m.creator })));
        console.log('🗂️ BULK ADD MEMES - User ID:', req.user._id);
        console.log('🗂️ BULK ADD MEMES - User ID type:', typeof req.user._id);

        if (memes.length !== memeIds.length) {
            console.log('❌ BULK ADD MEMES - Some memes not found or no permission');
            console.log('❌ BULK ADD MEMES - Expected:', memeIds.length, 'Found:', memes.length);
            return res.status(400).json({
                success: false,
                message: 'Some memes were not found or you do not have permission'
            });
        }

        // Add memes that aren't already in folder
        let addedCount = 0;
        console.log('🗂️ BULK ADD MEMES - Current folder memes:', folder.memes.length);
        
        for (const memeId of memeIds) {
            const memeObjectId = typeof memeId === 'string' ? new mongoose.Types.ObjectId(memeId) : memeId;
            const isAlreadyInFolder = folder.memes.some(existingId => existingId.equals(memeObjectId));
            
            if (!isAlreadyInFolder) {
                folder.memes.push(memeObjectId);
                addedCount++;
                console.log('🗂️ BULK ADD MEMES - Added meme:', memeId);
            } else {
                console.log('🗂️ BULK ADD MEMES - Meme already in folder:', memeId);
            }
        }

        folder.memeCount = folder.memes.length;
        folder.stats.lastUpdated = new Date();
        
        console.log('🗂️ BULK ADD MEMES - Saving folder with', addedCount, 'new memes...');
        await folder.save();

        console.log('✅ BULK ADD MEMES - Success! Added:', addedCount, 'Total in folder:', folder.memeCount);
        res.json({
            success: true,
            message: `${addedCount} memes added to folder successfully`,
            addedCount,
            totalInFolder: folder.memeCount
        });
    } catch (error) {
        console.error('❌ BULK ADD MEMES - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Generate share link for folder
// @route   POST /api/folders/:id/share
// @access  Private
const generateShareLink = async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        await folder.generateShareToken();

        res.json({
            success: true,
            message: 'Share link generated successfully',
            shareUrl: folder.shareUrl,
            shareToken: folder.sharing.shareToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get shared folder (public access)
// @route   GET /api/folders/shared/:token
// @access  Public
const getSharedFolder = async (req, res) => {
    try {
        const folder = await Folder.findOne({
            'sharing.shareToken': req.params.token,
            'sharing.isPublic': true
        }).populate({
            path: 'memes',
            select: 'title description imageUrl category createdAt stats',
            options: { sort: { createdAt: -1 } }
        }).populate('owner', 'username profile.displayName profile.avatar');

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Shared folder not found or no longer available'
            });
        }

        res.json({
            success: true,
            folder: {
                ...folder.toObject(),
                owner: {
                    username: folder.owner.username,
                    displayName: folder.owner.profile.displayName,
                    avatar: folder.owner.profile.avatar
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createFolder,
    getUserFolders,
    getFolder,
    updateFolder,
    deleteFolder,
    addMemeToFolder,
    removeMemeFromFolder,
    bulkAddMemesToFolder,
    generateShareLink,
    getSharedFolder
};
