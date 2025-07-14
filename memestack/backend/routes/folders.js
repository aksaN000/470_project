const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/folderController');
const { protect: auth } = require('../middleware/auth');

// Get help information about all folder endpoints
router.get('/help', (req, res) => {
    res.json({
        message: 'Folder Management API Endpoints',
        endpoints: [
            {
                path: 'GET /api/folders/help',
                description: 'Get help information about all folder endpoints'
            },
            {
                path: 'POST /api/folders',
                description: 'Create a new folder'
            },
            {
                path: 'GET /api/folders',
                description: 'Get user folders with pagination'
            },
            {
                path: 'GET /api/folders/:id',
                description: 'Get single folder with memes'
            },
            {
                path: 'PUT /api/folders/:id',
                description: 'Update folder details'
            },
            {
                path: 'DELETE /api/folders/:id',
                description: 'Delete folder'
            },
            {
                path: 'POST /api/folders/:id/memes/:memeId',
                description: 'Add meme to folder'
            },
            {
                path: 'DELETE /api/folders/:id/memes/:memeId',
                description: 'Remove meme from folder'
            },
            {
                path: 'POST /api/folders/:id/memes/bulk',
                description: 'Bulk add memes to folder'
            },
            {
                path: 'POST /api/folders/:id/share',
                description: 'Generate share link for folder'
            },
            {
                path: 'GET /api/folders/shared/:token',
                description: 'Get shared folder (public access)'
            }
        ]
    });
});

// Public routes
router.get('/shared/:token', getSharedFolder);

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

// Folder CRUD operations
router.post('/', createFolder);
router.get('/', getUserFolders);
router.get('/:id', getFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

// Meme management within folders
router.post('/:id/memes/:memeId', addMemeToFolder);
router.delete('/:id/memes/:memeId', removeMemeFromFolder);
router.post('/:id/memes/bulk', bulkAddMemesToFolder);

// Sharing
router.post('/:id/share', generateShareLink);

module.exports = router;
