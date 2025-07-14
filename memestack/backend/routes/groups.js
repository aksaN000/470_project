// 👥 Group Routes
// API endpoints for community groups

const express = require('express');
const router = express.Router();
const {
    getGroups,
    getGroupBySlug,
    createGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
    manageMembership,
    updateMemberRole,
    getTrendingGroups,
    getUserGroups,
    searchGroups,
    deleteGroup
} = require('../controllers/groupController');
const { protect: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateGroup = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Group name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Group name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('longDescription')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Long description cannot exceed 2000 characters'),
    body('category')
        .optional()
        .isIn([
            'general', 'gaming', 'sports', 'politics', 'entertainment',
            'technology', 'science', 'art', 'music', 'education',
            'business', 'lifestyle', 'food', 'travel', 'fashion',
            'dank', 'wholesome', 'dark_humor', 'nsfw', 'regional'
        ])
        .withMessage('Invalid category'),
    body('privacy')
        .optional()
        .isIn(['public', 'private', 'invite_only'])
        .withMessage('Invalid privacy setting'),
    body('membershipType')
        .optional()
        .isIn(['open', 'approval_required', 'invite_only'])
        .withMessage('Invalid membership type'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        next();
    }
];

const validateMembership = [
    body('userId')
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('action')
        .isIn(['approve', 'reject', 'ban', 'remove'])
        .withMessage('Invalid action'),
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Reason cannot exceed 300 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        next();
    }
];

const validateRole = [
    body('userId')
        .isMongoId()
        .withMessage('Invalid user ID'),
    body('role')
        .isIn(['member', 'moderator', 'admin'])
        .withMessage('Invalid role'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        next();
    }
];

const validateJoin = [
    body('message')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Message cannot exceed 300 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        next();
    }
];

// Public routes
router.get('/', getGroups);
router.get('/trending', getTrendingGroups);
router.get('/search', searchGroups);
router.get('/:slug', getGroupBySlug);

// Protected routes
router.use(auth); // All routes below require authentication

// Group management
router.post('/', validateGroup, createGroup);
router.put('/:slug', validateGroup, updateGroup);
router.delete('/:slug', deleteGroup);

// Membership management
router.post('/:slug/join', validateJoin, joinGroup);
router.post('/:slug/leave', leaveGroup);
router.post('/:slug/manage', validateMembership, manageMembership);
router.post('/:slug/role', validateRole, updateMemberRole);

// User groups
router.get('/user/groups', getUserGroups);

module.exports = router;
