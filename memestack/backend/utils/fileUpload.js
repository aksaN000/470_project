// 📁 File Upload Utility
// This handles file uploads for meme images

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const memesDir = path.join(uploadsDir, 'memes');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

[uploadsDir, memesDir, thumbnailsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, memesDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `meme-${uniqueSuffix}${ext}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 1 // Only 1 file at a time
    },
    fileFilter: fileFilter
});

// Upload middleware for single meme
const uploadMeme = upload.single('meme');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 10MB.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Only 1 file allowed.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field name. Use "meme" as field name.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Upload error: ' + err.message
                });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// Helper function to get file URL
const getFileUrl = (filename) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/memes/${filename}`;
};

// Helper function to delete file
const deleteFile = (filename) => {
    try {
        const filePath = path.join(memesDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${filename}`);
        }
    } catch (error) {
        console.error('❌ Error deleting file:', error);
    }
};

// Helper function to get file info
const getFileInfo = (file) => {
    if (!file) return null;
    
    return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        url: getFileUrl(file.filename),
        path: file.path
    };
};

module.exports = {
    uploadMeme,
    handleUploadError,
    getFileUrl,
    deleteFile,
    getFileInfo
};
