// 🤝 Collaboration Routes
// API endpoints for collaborations, remixes, and collaborative editing

const express = require('express');
const router = express.Router();
const {
    getCollaborations,
    getCollaborationById,
    createCollaboration,
    updateCollaboration,
    joinCollaboration,
    inviteUser,
    createVersion,
    forkCollaboration,
    addComment,
    deleteComment,
    getTrendingCollaborations,
    getUserCollaborations,
    getMemeRemixes,
    deleteCollaboration,
    removeCollaborator,
    acceptInvite,
    declineInvite,
    updateCollaboratorRole,
    getPendingInvites,
    // New advanced features
    mergeFork,
    getCollaborationTemplates,
    createFromTemplate,
    getCollaborationInsights,
    bulkOperations
} = require('../controllers/collaborationController');

// Import activity controller
const {
    getCollaborationActivity,
    trackUserActivity,
    getCollaborationStats
} = require('../controllers/collaborationActivityController');
const { protect: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware for creation
const validateCollaboration = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('type')
        .isIn(['remix', 'collaboration', 'template_creation'])
        .withMessage('Invalid collaboration type'),
    body('originalMeme')
        .optional()
        .isMongoId()
        .withMessage('Invalid original meme ID'),
    body('settings.maxCollaborators')
        .optional()
        .isInt({ min: 2, max: 50 })
        .withMessage('Max collaborators must be between 2 and 50'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Collaboration validation failed:', errors.array());
            console.log('Request body:', req.body);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        console.log('✅ Collaboration validation passed');
        next();
    }
];

// Validation middleware for updates (only validate provided fields)
const validateCollaborationUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('type')
        .optional()
        .isIn(['remix', 'collaboration', 'template_creation'])
        .withMessage('Invalid collaboration type'),
    body('status')
        .optional()
        .isIn(['draft', 'active', 'reviewing', 'completed'])
        .withMessage('Invalid status'),
    body('settings.maxCollaborators')
        .optional()
        .isInt({ min: 2, max: 50 })
        .withMessage('Max collaborators must be between 2 and 50'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Collaboration update validation failed:', errors.array());
            console.log('Request body:', req.body);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        console.log('✅ Collaboration update validation passed');
        next();
    }
];

const validateVersion = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Version title must be between 1 and 100 characters'),
    body('memeId')
        .isMongoId()
        .withMessage('Invalid meme ID'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('changes')
        .optional()
        .isArray()
        .withMessage('Changes must be an array'),
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

const validateInvite = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('role')
        .optional()
        .isIn(['contributor', 'editor', 'reviewer'])
        .withMessage('Invalid role'),
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

const validateComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment must be between 1 and 500 characters'),
    body('versionNumber')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid version number'),
    body('elementId')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Element ID cannot exceed 50 characters'),
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

const validateFork = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
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
router.get('/', getCollaborations);
router.get('/trending', getTrendingCollaborations);
router.get('/:id', getCollaborationById);
router.get('/meme/:memeId/remixes', getMemeRemixes);

// Protected routes
router.use(auth); // All routes below require authentication

// Collaboration management
router.post('/', validateCollaboration, createCollaboration);
router.put('/:id', auth, validateCollaborationUpdate, updateCollaboration);
router.delete('/:id', deleteCollaboration);

// Participation
router.post('/:id/join', validateJoin, joinCollaboration);
router.post('/:id/invite', validateInvite, inviteUser);
router.post('/:id/fork', validateFork, forkCollaboration);

// Version management
router.post('/:id/versions', validateVersion, createVersion);

// Comments
router.post('/:id/comments', auth, validateComment, addComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);

// User collaborations
router.get('/user/collaborations', getUserCollaborations);
router.get('/user/invites', getPendingInvites);

// Collaboration management (admin actions)
router.delete('/:id/collaborators/:collaboratorId', removeCollaborator);
router.put('/:id/collaborators/:collaboratorId/role', updateCollaboratorRole);

// Invite management
router.post('/:id/invites/accept', acceptInvite);
router.post('/:id/invites/decline', declineInvite);

// Advanced collaboration features
router.get('/templates', getCollaborationTemplates);
router.post('/from-template', auth, createFromTemplate);
router.post('/:id/merge-fork', auth, mergeFork);
router.get('/:id/insights', auth, getCollaborationInsights);
router.get('/:id/activity', getCollaborationActivity);
router.get('/:id/stats', getCollaborationStats);
router.post('/:id/track-activity', auth, trackUserActivity);
router.post('/bulk-operations', auth, bulkOperations);

module.exports = router;
