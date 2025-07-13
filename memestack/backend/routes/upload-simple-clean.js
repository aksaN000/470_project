const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
    const uploadsDir = path.join(__dirname, '../uploads/memes');
    try {
        await fs.access(uploadsDir);
    } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory:', uploadsDir);
    }
};

// Initialize uploads directory
ensureUploadsDir();

// Memory storage for processing before saving
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.post('/simple', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully!',
            data: {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

router.get('/meme', (req, res) => {
    res.json({
        success: true,
        message: 'Meme GET endpoint is working!',
        method: 'GET'
    });
});

router.post('/meme', protect, upload.single('meme'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Generate unique filename
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(__dirname, '../uploads/memes', uniqueFileName);

        // Process and save the image
        await sharp(req.file.buffer)
            .resize(800, 600, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(filePath);

        // Generate accessible URL
        const imageUrl = `http://localhost:5000/uploads/memes/${uniqueFileName}`;

        const responseData = {
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: uniqueFileName,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        };

        res.status(200).json(responseData);
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;
