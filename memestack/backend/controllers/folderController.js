const Folder = require('../models/Folder');
const Meme = require('../models/Meme');

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
    try {
        const { name, description, color, icon, isPrivate } = req.body;

        // Check if folder name already exists for this user
        const existingFolder = await Folder.findOne({
            owner: req.user.id,
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive
        });

        if (existingFolder) {
            return res.status(400).json({
                success: false,
                message: 'A folder with this name already exists'
            });
        }

        const folder = new Folder({
            name,
            description,
            color,
            icon,
            isPrivate,
            owner: req.user.id
        });

        await folder.save();

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
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

// @desc    Get user's folders
// @route   GET /api/folders
// @access  Private
const getUserFolders = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const folders = await Folder.findUserFolders(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder
        });

        const totalFolders = await Folder.countDocuments({ owner: req.user.id });
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
        const folder = await Folder.findOne({
            _id: req.params.id,
            owner: req.user.id
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
            owner: req.user.id
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
                owner: req.user.id,
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
            owner: req.user.id
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
            owner: req.user.id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Check if meme exists and belongs to user
        const meme = await Meme.findOne({
            _id: memeId,
            createdBy: req.user.id
        });

        if (!meme) {
            return res.status(404).json({
                success: false,
                message: 'Meme not found or you do not have permission'
            });
        }

        // Check if meme is already in folder
        if (folder.memes.includes(memeId)) {
            return res.status(400).json({
                success: false,
                message: 'Meme is already in this folder'
            });
        }

        await folder.addMeme(memeId);

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
            owner: req.user.id
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
        const { memeIds } = req.body;
        const folderId = req.params.id;

        if (!Array.isArray(memeIds) || memeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of meme IDs'
            });
        }

        const folder = await Folder.findOne({
            _id: folderId,
            owner: req.user.id
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Verify all memes belong to user
        const memes = await Meme.find({
            _id: { $in: memeIds },
            createdBy: req.user.id
        });

        if (memes.length !== memeIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some memes were not found or you do not have permission'
            });
        }

        // Add memes that aren't already in folder
        let addedCount = 0;
        for (const memeId of memeIds) {
            if (!folder.memes.includes(memeId)) {
                folder.memes.push(memeId);
                addedCount++;
            }
        }

        folder.memeCount = folder.memes.length;
        folder.stats.lastUpdated = new Date();
        await folder.save();

        res.json({
            success: true,
            message: `${addedCount} memes added to folder successfully`,
            addedCount,
            totalInFolder: folder.memeCount
        });
    } catch (error) {
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
            owner: req.user.id
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
