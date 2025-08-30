// 📁 Cloudinary Utility
// Helper functions for Cloudinary file upload and management

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (if environment variables are available)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️  Cloudinary environment variables not found. File uploads will use local storage fallback.');
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (buffer, options = {}) => {
    try {
        // If Cloudinary is not configured, throw an error immediately
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.log('📁 Cloudinary not fully configured - missing environment variables');
            throw new Error('Cloudinary configuration incomplete. Missing required environment variables.');
        }

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: 'auto',
                folder: 'memestack',
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                ...options
            };

            console.log('🔄 Uploading to Cloudinary with options:', {
                folder: uploadOptions.folder,
                transformation: uploadOptions.transformation
            });

            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
                } else {
                    console.log('✅ File uploaded to Cloudinary:', result.public_id);
                    resolve(result);
                }
            }).end(buffer);
        });
    } catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {Object} options - Deletion options
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
    try {
        // If Cloudinary is not configured, return mock success
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.log('📁 Mock deletion (Cloudinary not configured):', publicId);
            return { result: 'ok', deleted: { [publicId]: 'deleted' } };
        }

        const deleteOptions = {
            resource_type: 'image',
            ...options
        };

        const result = await cloudinary.uploader.destroy(publicId, deleteOptions);
        console.log('🗑️  File deleted from Cloudinary:', publicId);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary deletion failed:', error);
        throw new Error(`Deletion failed: ${error.message}`);
    }
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @returns {Promise<Object>} File information
 */
const getCloudinaryFileInfo = async (publicId) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.log('📁 Mock file info (Cloudinary not configured):', publicId);
            return {
                public_id: publicId,
                format: 'jpg',
                resource_type: 'image',
                type: 'upload',
                created_at: new Date().toISOString(),
                bytes: 1024000,
                width: 800,
                height: 600,
                secure_url: `/uploads/${publicId}.jpg`
            };
        }

        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('❌ Failed to get Cloudinary file info:', error);
        throw new Error(`Failed to get file info: ${error.message}`);
    }
};

/**
 * Generate transformation URL for an image
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformation options
 * @returns {string} Transformed image URL
 */
const generateTransformationUrl = (publicId, transformations = {}) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return `/uploads/${publicId}.jpg`;
        }

        return cloudinary.url(publicId, {
            secure: true,
            ...transformations
        });
    } catch (error) {
        console.error('❌ Failed to generate transformation URL:', error);
        return `/uploads/${publicId}.jpg`;
    }
};

/**
 * Create upload preset for frontend uploads
 * @param {Object} presetOptions - Preset configuration options
 * @returns {Promise<Object>} Created preset info
 */
const createUploadPreset = async (presetOptions = {}) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.log('📁 Mock upload preset (Cloudinary not configured)');
            return { name: 'memestack_unsigned', unsigned: true };
        }

        const defaultOptions = {
            name: 'memestack_unsigned',
            unsigned: true,
            folder: 'memestack',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            max_bytes: 10485760, // 10MB
            ...presetOptions
        };

        const result = await cloudinary.api.create_upload_preset(defaultOptions);
        console.log('✅ Upload preset created:', result.name);
        return result;
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Upload preset already exists');
            return { name: presetOptions.name || 'memestack_unsigned' };
        }
        console.error('❌ Failed to create upload preset:', error);
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getCloudinaryFileInfo,
    generateTransformationUrl,
    createUploadPreset,
    cloudinary // Export the configured cloudinary instance
};
