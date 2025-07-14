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
        console.log('🎨 Creating new template for user:', req.user._id);
        
        const { name, category, description, textAreas, isPublic } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Template image is required'
            });
        }

        // Upload template image to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'memestack/templates',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' },
                { format: 'auto' }
            ]
        });

        // Create template
        const template = new MemeTemplate({
            name,
            category: category || 'general',
            description: description || '',
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            textAreas: textAreas ? JSON.parse(textAreas) : [
                {
                    id: 'text1',
                    defaultText: 'Top Text',
                    position: { x: 50, y: 20 },
                    style: {
                        fontSize: 36,
                        fontFamily: 'Impact',
                        color: '#FFFFFF',
                        stroke: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    }
                },
                {
                    id: 'text2',
                    defaultText: 'Bottom Text',
                    position: { x: 50, y: 80 },
                    style: {
                        fontSize: 36,
                        fontFamily: 'Impact',
                        color: '#FFFFFF',
                        stroke: '#000000',
                        strokeWidth: 2,
                        textAlign: 'center'
                    }
                }
            ],
            creator: req.user._id,
            isPublic: isPublic === 'true' || false
        });

        await template.save();

        // Populate creator info
        await template.populate('creator', 'username email');

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
            query.$or.push({ creator: req.user._id });
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

        const templates = await MemeTemplate.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('creator', 'username email', null, { optional: true })
            .lean();

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
        const template = await MemeTemplate.findById(req.params.id)
            .populate('creator', 'username email');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Check if user can access this template
        if (!template.isPublic && !template.creator._id.equals(req.user._id)) {
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
        if (!template.creator.equals(req.user._id)) {
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
        await template.populate('creator', 'username email');

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
        if (!template.creator.equals(req.user._id)) {
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

        const templates = await MemeTemplate.find({ creator: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('creator', 'username email')
            .lean();

        const total = await MemeTemplate.countDocuments({ creator: req.user._id });

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

module.exports = {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    getTemplateCategories,
    getUserTemplates
};
