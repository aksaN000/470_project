// 🎨 Template Controller (MVC - Controller Layer)
// This handles all meme template creation and management operations

const MemeTemplate = require('../models/MemeTemplate');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Create a new meme template
// @route   POST /api/templates
// @access  Private
const createTemplate = async (req, res) => {
    try {
        console.log('🎨 Creating new template for user:', req.user?._id || 'No user found');
        console.log('📝 Request body:', req.body);
        console.log('📁 Request file:', req.file ? 'File present' : 'No file');
        
        const { name, category, description, textAreas, dimensions, isPublic } = req.body;
        
        if (!req.user) {
            console.log('❌ No authenticated user found');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'Template image is required'
            });
        }

        // Handle file upload - use local storage if Cloudinary not configured
        let imageUrl, cloudinaryId;
        
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            // Upload template image to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'memestack/templates',
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' },
                    { format: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
            cloudinaryId = result.public_id;
        } else {
            // Save to local storage
            const fs = require('fs');
            const path = require('path');
            
            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Generate unique filename
            const timestamp = Date.now();
            const extension = req.file.originalname.split('.').pop() || 'jpg';
            const filename = `template_${timestamp}.${extension}`;
            const filepath = path.join(uploadsDir, filename);
            
            // Save file
            fs.writeFileSync(filepath, req.file.buffer);
            
            // Set local URL
            imageUrl = `/uploads/${filename}`;
            cloudinaryId = null;
        }

        // Parse dimensions with validation
        let parsedDimensions;
        try {
            if (dimensions) {
                console.log('📐 Raw dimensions received:', dimensions);
                parsedDimensions = typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions;
                console.log('📐 Parsed dimensions:', parsedDimensions);
                
                // Ensure dimensions have required numeric values
                if (!parsedDimensions.width || !parsedDimensions.height) {
                    throw new Error('Dimensions must have width and height');
                }
                
                // Convert to numbers if they're strings
                parsedDimensions.width = Number(parsedDimensions.width);
                parsedDimensions.height = Number(parsedDimensions.height);
                
                // Validate dimensions are positive numbers
                if (isNaN(parsedDimensions.width) || isNaN(parsedDimensions.height) || 
                    parsedDimensions.width <= 0 || parsedDimensions.height <= 0) {
                    throw new Error('Dimensions must be positive numbers');
                }
            } else {
                parsedDimensions = {
                    width: 800,  // Default width
                    height: 600  // Default height
                };
            }
        } catch (error) {
            console.error('❌ Error parsing dimensions:', error);
            parsedDimensions = {
                width: 800,  // Default width
                height: 600  // Default height
            };
        }

        console.log('📐 Final dimensions to save:', parsedDimensions);

        // Create template
        const template = new MemeTemplate({
            name,
            category: category || 'popular',
            description: description || '',
            imageUrl: imageUrl,
            cloudinaryId: cloudinaryId,
            textAreas: textAreas ? JSON.parse(textAreas) : [
                {
                    id: 'text1',
                    x: 50,  // Percentage from left
                    y: 20,  // Percentage from top
                    width: 80,  // Percentage width
                    height: 15, // Percentage height
                    defaultText: 'Top Text',
                    fontSize: 36,
                    fontFamily: 'Impact',
                    fontColor: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    textAlign: 'center',
                    verticalAlign: 'middle'
                },
                {
                    id: 'text2',
                    x: 50,  // Percentage from left
                    y: 80,  // Percentage from top
                    width: 80,  // Percentage width
                    height: 15, // Percentage height
                    defaultText: 'Bottom Text',
                    fontSize: 36,
                    fontFamily: 'Impact',
                    fontColor: '#FFFFFF',
                    strokeColor: '#000000',
                    strokeWidth: 2,
                    textAlign: 'center',
                    verticalAlign: 'middle'
                }
            ],
            dimensions: parsedDimensions,
            createdBy: req.user._id,
            isPublic: isPublic === 'true' || false
        });

        await template.save();

        // Populate creator info
        await template.populate('createdBy', 'username email');

        console.log('✅ Template created successfully:', template._id);

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            template
        });

    } catch (error) {
        console.error('❌ Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating template',
            error: error.message
        });
    }
};

// @desc    Get all templates (public + user's private)
// @route   GET /api/templates
// @access  Private
const getTemplates = async (req, res) => {
    try {
        console.log('🔍 DEBUG: getTemplates called');
        const { 
            page = 1, 
            limit = 20, 
            category, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Build query
        const query = {
            $or: [
                { isPublic: true }
            ]
        };

        // If user is authenticated, also include their private templates
        if (req.user) {
            query.$or.push({ createdBy: req.user._id });
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            });
        }

        console.log('🔍 DEBUG: About to execute MemeTemplate.find query');
        const templates = await MemeTemplate.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username email', null, { optional: true })
            .lean();

        console.log('🔍 DEBUG: Query executed successfully, got', templates.length, 'templates');
        const total = await MemeTemplate.countDocuments(query);

        res.json({
            success: true,
            templates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTemplates: total,
                hasNext: skip + templates.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching templates',
            error: error.message
        });
    }
};

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Private
const getTemplateById = async (req, res) => {
    try {
        console.log('🎯 getTemplateById called with ID:', req.params.id);
        const template = await MemeTemplate.findById(req.params.id)
            .populate('createdBy', 'username email');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Check if user can access this template
        if (!template.isPublic && !template.createdBy._id.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this template'
            });
        }

        // Increment usage count
        template.usageCount += 1;
        await template.save();

        res.json({
            success: true,
            template
        });

    } catch (error) {
        console.error('❌ Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template',
            error: error.message
        });
    }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private (own templates only)
const updateTemplate = async (req, res) => {
    try {
        const template = await MemeTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Check ownership
        if (!template.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own templates.'
            });
        }

        const { name, category, description, textAreas, isPublic } = req.body;

        // Update fields
        if (name) template.name = name;
        if (category) template.category = category;
        if (description !== undefined) template.description = description;
        if (textAreas) template.textAreas = JSON.parse(textAreas);
        if (isPublic !== undefined) template.isPublic = isPublic === 'true';

        // Handle new image upload
        if (req.file) {
            // Delete old image from Cloudinary
            if (template.cloudinaryId) {
                await deleteFromCloudinary(template.cloudinaryId);
            }

            // Upload new image
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'memestack/templates',
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' },
                    { format: 'auto' }
                ]
            });

            template.imageUrl = result.secure_url;
            template.cloudinaryId = result.public_id;
        }

        await template.save();
        await template.populate('createdBy', 'username email');

        res.json({
            success: true,
            message: 'Template updated successfully',
            template
        });

    } catch (error) {
        console.error('❌ Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating template',
            error: error.message
        });
    }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private (own templates only)
const deleteTemplate = async (req, res) => {
    try {
        const template = await MemeTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Check ownership
        if (!template.createdBy.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own templates.'
            });
        }

        // Delete image from Cloudinary
        if (template.cloudinaryId) {
            await deleteFromCloudinary(template.cloudinaryId);
        }

        await MemeTemplate.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting template',
            error: error.message
        });
    }
};

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Public
const getTemplateCategories = async (req, res) => {
    try {
        const categories = await MemeTemplate.distinct('category');
        
        res.json({
            success: true,
            categories: categories.sort()
        });

    } catch (error) {
        console.error('❌ Error fetching template categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template categories',
            error: error.message
        });
    }
};

// @desc    Get user's templates
// @route   GET /api/templates/my-templates
// @access  Private
const getUserTemplates = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const templates = await MemeTemplate.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username email')
            .lean();

        const total = await MemeTemplate.countDocuments({ createdBy: req.user._id });

        res.json({
            success: true,
            templates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTemplates: total,
                hasNext: skip + templates.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching user templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user templates',
            error: error.message
        });
    }
};

// @desc    Get trending templates
// @route   GET /api/templates/trending
// @access  Public
const getTrendingTemplates = async (req, res) => {
    try {
        console.log('🔥 getTrendingTemplates called!');
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        // Calculate trending score based on usage count, rating, and recency
        const templates = await MemeTemplate.aggregate([
            {
                $match: {
                    isPublic: true,
                    isActive: true
                }
            },
            {
                $addFields: {
                    trendingScore: {
                        $add: [
                            { $multiply: ['$usageCount', 2] }, // Usage weight: 2x
                            { $multiply: ['$averageRating', 10] }, // Rating weight: 10x
                            {
                                $divide: [
                                    { $subtract: [new Date(), '$createdAt'] },
                                    1000 * 60 * 60 * 24 * 7 // Divide by week in ms for recency
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { trendingScore: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                    pipeline: [{ $project: { username: 1, email: 1 } }]
                }
            },
            {
                $unwind: '$createdBy'
            }
        ]);

        const total = await MemeTemplate.countDocuments({ isPublic: true, isActive: true });

        res.json({
            success: true,
            templates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTemplates: total,
                hasNext: skip + templates.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching trending templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending templates',
            error: error.message
        });
    }
};

// @desc    Get user's favorite templates
// @route   GET /api/templates/favorites
// @access  Private
const getFavoriteTemplates = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user._id).populate({
            path: 'favoriteTemplates',
            match: { isActive: true },
            options: {
                sort: { createdAt: -1 },
                skip: skip,
                limit: parseInt(limit)
            },
            populate: {
                path: 'createdBy',
                select: 'username email'
            }
        });

        const templates = user.favoriteTemplates || [];
        const totalFavorites = await User.aggregate([
            { $match: { _id: req.user._id } },
            { $project: { favoriteCount: { $size: '$favoriteTemplates' } } }
        ]);

        const total = totalFavorites[0]?.favoriteCount || 0;

        res.json({
            success: true,
            templates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTemplates: total,
                hasNext: skip + templates.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching favorite templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorite templates',
            error: error.message
        });
    }
};

// @desc    Favorite a template
// @route   POST /api/templates/:id/favorite
// @access  Private
const favoriteTemplate = async (req, res) => {
    try {
        const template = await MemeTemplate.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const user = await User.findById(req.user._id);
        
        // Check if already favorited
        if (user.favoriteTemplates.includes(template._id)) {
            return res.status(400).json({
                success: false,
                message: 'Template already in favorites'
            });
        }

        // Add to user's favorites
        user.favoriteTemplates.push(template._id);
        await user.save();

        // Increment template's favorite count
        template.favoriteCount = (template.favoriteCount || 0) + 1;
        await template.save();

        res.json({
            success: true,
            message: 'Template added to favorites',
            favoriteCount: template.favoriteCount
        });

    } catch (error) {
        console.error('❌ Error favoriting template:', error);
        res.status(500).json({
            success: false,
            message: 'Error favoriting template',
            error: error.message
        });
    }
};

// @desc    Unfavorite a template
// @route   DELETE /api/templates/:id/favorite
// @access  Private
const unfavoriteTemplate = async (req, res) => {
    try {
        const template = await MemeTemplate.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const user = await User.findById(req.user._id);
        
        // Check if favorited
        const favoriteIndex = user.favoriteTemplates.indexOf(template._id);
        if (favoriteIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Template not in favorites'
            });
        }

        // Remove from user's favorites
        user.favoriteTemplates.splice(favoriteIndex, 1);
        await user.save();

        // Decrement template's favorite count
        template.favoriteCount = Math.max((template.favoriteCount || 0) - 1, 0);
        await template.save();

        res.json({
            success: true,
            message: 'Template removed from favorites',
            favoriteCount: template.favoriteCount
        });

    } catch (error) {
        console.error('❌ Error unfavoriting template:', error);
        res.status(500).json({
            success: false,
            message: 'Error unfavoriting template',
            error: error.message
        });
    }
};

// @desc    Rate a template
// @route   POST /api/templates/:id/rate
// @access  Private
const rateTemplate = async (req, res) => {
    try {
        const { rating } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const template = await MemeTemplate.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Check if user already rated this template
        const existingRatingIndex = template.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingRatingIndex !== -1) {
            // Update existing rating
            template.ratings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating
            template.ratings.push({
                user: req.user._id,
                rating: rating
            });
        }

        // Recalculate average rating
        const totalRatings = template.ratings.reduce((sum, r) => sum + r.rating, 0);
        template.averageRating = totalRatings / template.ratings.length;
        template.ratingCount = template.ratings.length;

        await template.save();

        res.json({
            success: true,
            message: 'Template rated successfully',
            averageRating: template.averageRating,
            ratingCount: template.ratingCount,
            userRating: rating
        });

    } catch (error) {
        console.error('❌ Error rating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error rating template',
            error: error.message
        });
    }
};

// @desc    Download template
// @route   GET /api/templates/:id/download
// @access  Public
const downloadTemplate = async (req, res) => {
    try {
        const template = await MemeTemplate.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Increment download count
        template.downloadCount = (template.downloadCount || 0) + 1;
        template.usageCount = (template.usageCount || 0) + 1;
        await template.save();

        res.json({
            success: true,
            template: {
                id: template._id,
                name: template.name,
                imageUrl: template.imageUrl,
                textAreas: template.textAreas,
                category: template.category,
                downloadCount: template.downloadCount
            }
        });

    } catch (error) {
        console.error('❌ Error downloading template:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading template',
            error: error.message
        });
    }
};

module.exports = {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    getTemplateCategories,
    getUserTemplates,
    getTrendingTemplates,
    getFavoriteTemplates,
    favoriteTemplate,
    unfavoriteTemplate,
    rateTemplate,
    downloadTemplate
};
