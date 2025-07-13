// 📸 Image Upload Middleware
// Handles file uploads with validation and processing

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// ========================================
// STORAGE CONFIGURATION
// ========================================

// Ensure uploads directory exists
const createUploadDirectories = async () => {
    const dirs = [
        'uploads',
        'uploads/memes',
        'uploads/memes/originals',
        'uploads/memes/thumbnails',
        'uploads/memes/optimized'
    ];

    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    }
};

// Initialize directories
createUploadDirectories();

// ========================================
// MULTER CONFIGURATION
// ========================================

// Memory storage for processing before saving
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    console.log('🔍 Validating file:', file.originalname, file.mimetype);
    
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        // Allowed image types
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
        }
    } else {
        cb(new Error('Only image files are allowed.'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Single file upload
    }
});

// ========================================
// IMAGE PROCESSING FUNCTIONS
// ========================================

// Process and save image in multiple formats
const processImage = async (buffer, originalName) => {
    try {
        console.log('🖼️ Processing image:', originalName);
        
        // Generate unique filename
        const fileId = uuidv4();
        const ext = path.extname(originalName).toLowerCase();
        const baseName = `${fileId}`;
        
        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        console.log('📊 Image metadata:', {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: Math.round(buffer.length / 1024) + 'KB'
        });
        
        // File paths
        const originalPath = `uploads/memes/originals/${baseName}${ext}`;
        const optimizedPath = `uploads/memes/optimized/${baseName}.webp`;
        const thumbnailPath = `uploads/memes/thumbnails/${baseName}_thumb.webp`;
        
        // Save original file
        await fs.writeFile(originalPath, buffer);
        console.log('💾 Saved original:', originalPath);
        
        // Create optimized version (max 1200px width, WebP format)
        await sharp(buffer)
            .resize(1200, null, { 
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 85 })
            .toFile(optimizedPath);
        console.log('✨ Created optimized:', optimizedPath);
        
        // Create thumbnail (300px width)
        await sharp(buffer)
            .resize(300, 300, { 
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(thumbnailPath);
        console.log('🖼️ Created thumbnail:', thumbnailPath);
        
        // Return file information
        return {
            fileId,
            originalName,
            originalPath,
            optimizedPath,
            thumbnailPath,
            size: buffer.length,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        };
        
    } catch (error) {
        console.error('❌ Image processing error:', error);
        throw new Error('Failed to process image: ' + error.message);
    }
};

// ========================================
// MIDDLEWARE FUNCTIONS
// ========================================

// Single image upload middleware
const uploadSingle = upload.single('image');

// Process uploaded image middleware
const processUploadedImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }
        
        console.log('📤 Processing uploaded file:', req.file.originalname);
        
        // Process the image
        const processedImage = await processImage(req.file.buffer, req.file.originalname);
        
        // Add processed image info to request
        req.processedImage = processedImage;
        
        next();
        
    } catch (error) {
        console.error('❌ Image processing middleware error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to process image'
        });
    }
};

// ========================================
// CLEANUP FUNCTIONS
// ========================================

// Delete image files
const deleteImageFiles = async (imageData) => {
    try {
        const filesToDelete = [
            imageData.originalPath,
            imageData.optimizedPath,
            imageData.thumbnailPath
        ];
        
        for (const filePath of filesToDelete) {
            try {
                await fs.unlink(filePath);
                console.log('🗑️ Deleted file:', filePath);
            } catch (error) {
                console.warn('⚠️ Could not delete file:', filePath);
            }
        }
    } catch (error) {
        console.error('❌ Error deleting image files:', error);
    }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
    uploadSingle,
    processUploadedImage,
    processImage,
    deleteImageFiles,
    createUploadDirectories
};
