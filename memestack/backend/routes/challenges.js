// 🏆 Challenge Routes
// API endpoints for meme challenges and contests

const express = require('express');
const router = express.Router();
const {
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    joinChallenge,
    submitMeme,
    voteOnSubmission,
    getTrendingChallenges,
    getUserChallenges,
    deleteChallenge
} = require('../controllers/challengeController');
const { protect: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateChallenge = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 0, max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('type')
        .optional()
        .isIn(['contest', 'challenge', 'collaboration'])
        .withMessage('Invalid challenge type'),
    body('category')
        .optional()
        .isIn([
            'reaction', 'mocking', 'success', 'fail', 'advice',
            'rage', 'philosoraptor', 'first_world_problems', 
            'conspiracy', 'confession', 'socially_awkward',
            'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
        ])
        .withMessage('Invalid category'),
    body('maxParticipants')
        .optional()
        .isInt({ min: 2, max: 1000 })
        .withMessage('Max participants must be between 2 and 1000'),
    (req, res, next) => {
        console.log('🔍 CHALLENGE VALIDATION - Request body:', JSON.stringify(req.body, null, 2));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ CHALLENGE VALIDATION - Errors:', errors.array());
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }
        console.log('✅ Challenge validation passed');
        next();
    }
];

const validateSubmission = [
    body('memeId')
        .isMongoId()
        .withMessage('Invalid meme ID'),
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
router.get('/', getChallenges);
router.get('/trending', getTrendingChallenges);
router.get('/:id', getChallengeById);

// Protected routes
router.use(auth); // All routes below require authentication

// User challenges (before :id routes to avoid conflicts)
router.get('/user/challenges', getUserChallenges);

// Challenge management
router.post('/', auth, validateChallenge, createChallenge);
router.put('/:id', auth, validateChallenge, updateChallenge);
router.delete('/:id', auth, deleteChallenge);

// Participation
router.post('/:id/join', auth, joinChallenge);
router.post('/:id/submit', auth, validateSubmission, submitMeme);
router.post('/:id/submissions/:submissionId/vote', auth, voteOnSubmission);

module.exports = router;
