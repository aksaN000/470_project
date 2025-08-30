const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Check if we're in a serverless environment (like Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME;

// Ensure uploads directory exists (only for local development)
const ensureUploadsDir = async () => {
    if (isServerless) {
        console.log('🌐 Running in serverless environment - skipping local directory creation');
        return;
    }
    
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

        let imageUrl;
        let filename;

        if (isServerless || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
            // Use Cloudinary for serverless environments or if Cloudinary is properly configured
            console.log('📤 Uploading to Cloudinary...');
            
            try {
                const result = await uploadToCloudinary(req.file.buffer, {
                    folder: 'memestack/memes',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto' },
                        { format: 'auto' }
                    ]
                });
                
                imageUrl = result.secure_url;
                filename = result.public_id;
                console.log('✅ Image uploaded to Cloudinary:', imageUrl);
                
            } catch (cloudinaryError) {
                console.error('❌ Cloudinary upload failed:', cloudinaryError);
                
                // Fallback to local storage in development
                if (!isServerless) {
                    console.log('⚠️ Falling back to local storage...');
                    await ensureUploadsDir();

                    const fileExtension = path.extname(req.file.originalname);
                    const uniqueFileName = `${uuidv4()}${fileExtension}`;
                    const filePath = path.join(__dirname, '../uploads/memes', uniqueFileName);

                    await sharp(req.file.buffer)
                        .resize(800, 600, { 
                            fit: 'inside', 
                            withoutEnlargement: true 
                        })
                        .jpeg({ quality: 85 })
                        .toFile(filePath);

                    const protocol = req.protocol || 'http';
                    const host = req.get('host') || 'localhost:5000';
                    imageUrl = `${protocol}://${host}/uploads/memes/${uniqueFileName}`;
                    filename = uniqueFileName;
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to cloud storage',
                        error: cloudinaryError.message || 'Cloudinary upload failed'
                    });
                }
            }
        } else {
            // Use local storage for development
            console.log('📤 Uploading to local storage...');
            
            await ensureUploadsDir();

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

            // Generate accessible URL using the request host
            const protocol = req.protocol || 'http';
            const host = req.get('host') || 'localhost:5000';
            imageUrl = `${protocol}://${host}/uploads/memes/${uniqueFileName}`;
            filename = uniqueFileName;
        }

        const responseData = {
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: filename,
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

// Profile picture upload endpoint
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No avatar file uploaded'
            });
        }

        let avatarUrl;
        let filename;

        if (isServerless || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
            // Use Cloudinary for serverless environments or if Cloudinary is properly configured
            console.log('📤 Uploading avatar to Cloudinary...');
            
            try {
                const result = await uploadToCloudinary(req.file.buffer, {
                    folder: 'memestack/avatars',
                    transformation: [
                        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                        { quality: 'auto' },
                        { format: 'auto' }
                    ]
                });
                
                avatarUrl = result.secure_url;
                filename = result.public_id;
                console.log('✅ Avatar uploaded to Cloudinary:', avatarUrl);
                
            } catch (cloudinaryError) {
                console.error('❌ Cloudinary avatar upload failed:', cloudinaryError);
                
                // Fallback to local storage in development
                if (!isServerless) {
                    console.log('⚠️ Falling back to local storage for avatar...');
                    
                    const avatarsDir = path.join(__dirname, '../uploads/avatars');
                    try {
                        await fs.access(avatarsDir);
                    } catch {
                        await fs.mkdir(avatarsDir, { recursive: true });
                        console.log('📁 Created avatars directory:', avatarsDir);
                    }

                    const fileExtension = path.extname(req.file.originalname);
                    const uniqueFileName = `${uuidv4()}${fileExtension}`;
                    const filePath = path.join(avatarsDir, uniqueFileName);

                    await sharp(req.file.buffer)
                        .resize(200, 200, { 
                            fit: 'cover',
                            position: 'center'
                        })
                        .jpeg({ quality: 90 })
                        .toFile(filePath);

                    const protocol = req.protocol || 'http';
                    const host = req.get('host') || 'localhost:5000';
                    avatarUrl = `${protocol}://${host}/uploads/avatars/${uniqueFileName}`;
                    filename = uniqueFileName;
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload avatar to cloud storage',
                        error: cloudinaryError.message || 'Cloudinary upload failed'
                    });
                }
            }
        } else {
            // Use local storage for development
            console.log('📤 Uploading avatar to local storage...');
            
            // Ensure avatars directory exists
            const avatarsDir = path.join(__dirname, '../uploads/avatars');
            try {
                await fs.access(avatarsDir);
            } catch {
                await fs.mkdir(avatarsDir, { recursive: true });
                console.log('📁 Created avatars directory:', avatarsDir);
            }

            // Generate unique filename for avatar
            const fileExtension = path.extname(req.file.originalname);
            const uniqueFileName = `${uuidv4()}${fileExtension}`;
            const filePath = path.join(avatarsDir, uniqueFileName);

            // Process and save the avatar (square crop, smaller size)
            await sharp(req.file.buffer)
                .resize(200, 200, { 
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 90 })
                .toFile(filePath);

            // Generate accessible URL using the request host
            const protocol = req.protocol || 'http';
            const host = req.get('host') || 'localhost:5000';
            avatarUrl = `${protocol}://${host}/uploads/avatars/${uniqueFileName}`;
            filename = uniqueFileName;
        }

        console.log('✅ Avatar uploaded successfully:', avatarUrl);

        const responseData = {
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                url: avatarUrl,
                filename: filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        };

        res.status(200).json(responseData);
        
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Avatar upload failed',
            error: error.message
        });
    }
});

module.exports = router;
