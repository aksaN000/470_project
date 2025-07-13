// 🎨 Template Routes (MVC - Routes Layer)
// This defines all API endpoints for meme template operations

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import middleware
const { protect, optionalAuth } = require('../middleware/auth');

// Import controller functions
const {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    getTemplateCategories,
    getUserTemplates
} = require('../controllers/templateController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// ========================================
// TEMPLATE ROUTES
// ========================================

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Public
router.get('/categories', getTemplateCategories);

// @desc    Get user's templates
// @route   GET /api/templates/my-templates
// @access  Private
router.get('/my-templates', protect, getUserTemplates);

// @desc    Create a new template
// @route   POST /api/templates
// @access  Private
router.post('/', protect, upload.single('image'), createTemplate);

// @desc    Get all templates (public + user's private)
// @route   GET /api/templates
// @access  Public (but user-specific data if authenticated)
router.get('/', optionalAuth, getTemplates);

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Public
router.get('/:id', optionalAuth, getTemplateById);

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private (own templates only)
router.put('/:id', protect, upload.single('image'), updateTemplate);

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private (own templates only)
router.delete('/:id', protect, deleteTemplate);

// ========================================
// ROUTE DOCUMENTATION & HELP
// ========================================

// Add route documentation endpoint
router.get('/help/routes', (req, res) => {
    res.json({
        success: true,
        message: 'MemeStack API - Template Routes Documentation',
        routes: {
            templates: {
                'GET /api/templates': {
                    description: 'Get all accessible templates (public + user\'s private)',
                    access: 'Private',
                    parameters: {
                        page: 'Page number (default: 1)',
                        limit: 'Items per page (default: 20)',
                        category: 'Filter by category',
                        search: 'Search templates by name/description',
                        sortBy: 'Sort field (default: createdAt)',
                        sortOrder: 'Sort order: asc/desc (default: desc)'
                    },
                    example: 'GET /api/templates?category=funny&page=1&limit=10'
                },
                'POST /api/templates': {
                    description: 'Create a new meme template',
                    access: 'Private',
                    body: {
                        image: 'Template image file (required)',
                        name: 'Template name (required)',
                        category: 'Template category (optional)',
                        description: 'Template description (optional)',
                        textAreas: 'JSON string of text area configurations (optional)',
                        isPublic: 'Make template public (true/false, default: false)'
                    }
                },
                'GET /api/templates/:id': {
                    description: 'Get template by ID',
                    access: 'Private',
                    example: 'GET /api/templates/507f1f77bcf86cd799439011'
                },
                'PUT /api/templates/:id': {
                    description: 'Update template (own templates only)',
                    access: 'Private',
                    body: 'Same as POST, all fields optional'
                },
                'DELETE /api/templates/:id': {
                    description: 'Delete template (own templates only)',
                    access: 'Private'
                },
                'GET /api/templates/categories': {
                    description: 'Get all template categories',
                    access: 'Public'
                },
                'GET /api/templates/my-templates': {
                    description: 'Get user\'s templates',
                    access: 'Private',
                    parameters: {
                        page: 'Page number (default: 1)',
                        limit: 'Items per page (default: 20)'
                    }
                }
            }
        },
        authentication: 'Include Bearer token in Authorization header for private routes',
        notes: [
            'Template images are automatically optimized and stored in Cloudinary',
            'Text areas define editable text regions with position and styling',
            'Public templates are accessible to all users',
            'Private templates are only accessible to their creators',
            'Template usage is tracked for analytics'
        ]
    });
});

module.exports = router;
