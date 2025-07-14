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
    getTrendingCollaborations,
    getUserCollaborations,
    getMemeRemixes,
    deleteCollaboration
} = require('../controllers/collaborationController');
const { protect: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
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
        .isIn(['remix', 'collaboration', 'template_creation', 'challenge_response'])
        .withMessage('Invalid collaboration type'),
    body('originalMeme')
        .optional()
        .isMongoId()
        .withMessage('Invalid original meme ID'),
    body('challenge')
        .optional()
        .isMongoId()
        .withMessage('Invalid challenge ID'),
    body('group')
        .optional()
        .isMongoId()
        .withMessage('Invalid group ID'),
    body('settings.maxCollaborators')
        .optional()
        .isInt({ min: 2, max: 50 })
        .withMessage('Max collaborators must be between 2 and 50'),
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
router.put('/:id', validateCollaboration, updateCollaboration);
router.delete('/:id', deleteCollaboration);

// Participation
router.post('/:id/join', validateJoin, joinCollaboration);
router.post('/:id/invite', validateInvite, inviteUser);
router.post('/:id/fork', validateFork, forkCollaboration);

// Version management
router.post('/:id/versions', validateVersion, createVersion);

// Comments
router.post('/:id/comments', validateComment, addComment);

// User collaborations
router.get('/user/collaborations', getUserCollaborations);

module.exports = router;
