// 📦 Batch Processing Utilities
// Handles batch operations on multiple images

import { addTextWatermark, addImageWatermark, addPatternWatermark, loadImage, blobToFile } from './watermark';

/**
 * Process multiple images with the same operation
 * @param {Array} images - Array of image files or URLs
 * @param {string} operation - Type of operation (watermark, resize, format)
 * @param {Object} options - Operation options
 * @param {Function} onProgress - Progress callback (current, total)
 * @param {Function} onError - Error callback for individual items
 * @returns {Promise<Array>} - Array of processed results
 */
export const batchProcess = async (images, operation, options = {}, onProgress = null, onError = null) => {
    const results = [];
    const total = images.length;
    
    for (let i = 0; i < images.length; i++) {
        try {
            if (onProgress) onProgress(i + 1, total);
            
            const result = await processImage(images[i], operation, options);
            results.push({
                index: i,
                success: true,
                result: result,
                original: images[i]
            });
        } catch (error) {
            const errorResult = {
                index: i,
                success: false,
                error: error.message,
                original: images[i]
            };
            results.push(errorResult);
            
            if (onError) onError(errorResult);
        }
    }
    
    return results;
};

/**
 * Process a single image based on operation type
 * @param {File|string} image - Image file or URL
 * @param {string} operation - Operation type
 * @param {Object} options - Operation options
 * @returns {Promise<Object>} - Processing result
 */
const processImage = async (image, operation, options) => {
    const sourceImage = await loadImage(image);
    
    switch (operation) {
        case 'watermark':
            return await processWatermark(sourceImage, image, options);
        case 'resize':
            return await processResize(sourceImage, image, options);
        case 'format':
            return await processFormat(sourceImage, image, options);
        case 'compress':
            return await processCompress(sourceImage, image, options);
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
};

/**
 * Apply watermark to an image
 * @param {HTMLImageElement} sourceImage - Loaded image
 * @param {File|string} originalImage - Original image reference
 * @param {Object} options - Watermark options
 * @returns {Promise<Object>} - Watermark result
 */
const processWatermark = async (sourceImage, originalImage, options) => {
    const { type, ...watermarkOptions } = options;
    let blob;
    
    switch (type) {
        case 'text':
            blob = await addTextWatermark(sourceImage, watermarkOptions);
            break;
        case 'image':
            if (!options.watermarkImage) {
                throw new Error('Watermark image is required for image watermarks');
            }
            const watermarkImage = await loadImage(options.watermarkImage);
            blob = await addImageWatermark(sourceImage, watermarkImage, watermarkOptions);
            break;
        case 'pattern':
            blob = await addPatternWatermark(sourceImage, watermarkOptions.text || 'MemeStack', watermarkOptions);
            break;
        default:
            throw new Error(`Unknown watermark type: ${type}`);
    }
    
    const filename = getProcessedFilename(originalImage, 'watermarked');
    return {
        blob,
        file: blobToFile(blob, filename),
        url: URL.createObjectURL(blob),
        operation: 'watermark',
        filename
    };
};

/**
 * Resize an image
 * @param {HTMLImageElement} sourceImage - Loaded image
 * @param {File|string} originalImage - Original image reference
 * @param {Object} options - Resize options
 * @returns {Promise<Object>} - Resize result
 */
const processResize = async (sourceImage, originalImage, options) => {
    const { width, height, maintainAspectRatio = true, quality = 0.9 } = options;
    
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let newWidth = width || sourceImage.width;
            let newHeight = height || sourceImage.height;
            
            if (maintainAspectRatio) {
                const aspectRatio = sourceImage.width / sourceImage.height;
                
                if (width && !height) {
                    newHeight = width / aspectRatio;
                } else if (!width && height) {
                    newWidth = height * aspectRatio;
                } else if (width && height) {
                    // Fit within bounds while maintaining aspect ratio
                    const targetAspectRatio = width / height;
                    if (aspectRatio > targetAspectRatio) {
                        newWidth = width;
                        newHeight = width / aspectRatio;
                    } else {
                        newHeight = height;
                        newWidth = height * aspectRatio;
                    }
                }
            }
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            ctx.drawImage(sourceImage, 0, 0, newWidth, newHeight);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = getProcessedFilename(originalImage, `resized_${newWidth}x${newHeight}`);
                    resolve({
                        blob,
                        file: blobToFile(blob, filename),
                        url: URL.createObjectURL(blob),
                        operation: 'resize',
                        filename,
                        dimensions: { width: newWidth, height: newHeight }
                    });
                } else {
                    reject(new Error('Failed to resize image'));
                }
            }, 'image/png', quality);
            
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Convert image format
 * @param {HTMLImageElement} sourceImage - Loaded image
 * @param {File|string} originalImage - Original image reference
 * @param {Object} options - Format options
 * @returns {Promise<Object>} - Format conversion result
 */
const processFormat = async (sourceImage, originalImage, options) => {
    const { format = 'png', quality = 0.9 } = options;
    
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = sourceImage.width;
            canvas.height = sourceImage.height;
            
            // For JPEG, fill with white background
            if (format === 'jpeg' || format === 'jpg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(sourceImage, 0, 0);
            
            const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = getProcessedFilename(originalImage, `converted`, format);
                    resolve({
                        blob,
                        file: blobToFile(blob, filename),
                        url: URL.createObjectURL(blob),
                        operation: 'format',
                        filename,
                        format: format
                    });
                } else {
                    reject(new Error('Failed to convert image format'));
                }
            }, mimeType, quality);
            
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Compress an image
 * @param {HTMLImageElement} sourceImage - Loaded image
 * @param {File|string} originalImage - Original image reference
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compression result
 */
const processCompress = async (sourceImage, originalImage, options) => {
    const { quality = 0.7, maxWidth = null, maxHeight = null } = options;
    
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let { width, height } = sourceImage;
            
            // Resize if max dimensions are specified
            if (maxWidth || maxHeight) {
                const aspectRatio = width / height;
                
                if (maxWidth && width > maxWidth) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                }
                
                if (maxHeight && height > maxHeight) {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(sourceImage, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = getProcessedFilename(originalImage, 'compressed');
                    resolve({
                        blob,
                        file: blobToFile(blob, filename),
                        url: URL.createObjectURL(blob),
                        operation: 'compress',
                        filename,
                        originalSize: originalImage.size || 0,
                        compressedSize: blob.size,
                        compressionRatio: originalImage.size ? ((originalImage.size - blob.size) / originalImage.size * 100).toFixed(1) : 0
                    });
                } else {
                    reject(new Error('Failed to compress image'));
                }
            }, 'image/jpeg', quality);
            
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate processed filename
 * @param {File|string} originalImage - Original image
 * @param {string} suffix - Filename suffix
 * @param {string} extension - New extension (optional)
 * @returns {string} - New filename
 */
const getProcessedFilename = (originalImage, suffix, extension = null) => {
    let baseName = 'processed_image';
    
    if (originalImage instanceof File) {
        baseName = originalImage.name.split('.')[0];
    } else if (typeof originalImage === 'string') {
        baseName = originalImage.split('/').pop().split('.')[0] || 'image';
    }
    
    const timestamp = Date.now();
    const ext = extension || 'png';
    
    return `${baseName}_${suffix}_${timestamp}.${ext}`;
};

/**
 * Download batch results as a ZIP file
 * @param {Array} results - Batch processing results
 * @param {string} zipFilename - ZIP filename
 */
export const downloadBatchResults = async (results, zipFilename = 'batch_processed_images.zip') => {
    // Note: This requires a ZIP library like JSZip
    // For now, we'll download individual files
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
        throw new Error('No successful results to download');
    }
    
    // If only one file, download directly
    if (successfulResults.length === 1) {
        const result = successfulResults[0].result;
        const url = result.url;
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        return;
    }
    
    // For multiple files, download each individually
    // In a real implementation, you'd want to use JSZip
    for (const result of successfulResults) {
        const url = result.result.url;
        const a = document.createElement('a');
        a.href = url;
        a.download = result.result.filename;
        a.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};

/**
 * Create a preview grid for batch results
 * @param {Array} results - Batch processing results
 * @returns {Array} - Preview data for UI
 */
export const createBatchPreview = (results) => {
    return results.map((result, index) => ({
        index,
        success: result.success,
        original: result.original,
        processed: result.success ? result.result : null,
        error: result.error || null,
        preview: result.success ? result.result.url : null,
        filename: result.success ? result.result.filename : null
    }));
};

/**
 * Validate images for batch processing
 * @param {Array} files - File array
 * @param {Object} constraints - Validation constraints
 * @returns {Object} - Validation result
 */
export const validateBatchImages = (files, constraints = {}) => {
    const {
        maxFiles = 50,
        maxFileSize = 10 * 1024 * 1024, // 10MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    } = constraints;
    
    const errors = [];
    const validFiles = [];
    
    if (files.length > maxFiles) {
        errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
        return { valid: false, errors, validFiles };
    }
    
    files.forEach((file, index) => {
        const fileErrors = [];
        
        if (!allowedTypes.includes(file.type)) {
            fileErrors.push(`Invalid file type: ${file.type}`);
        }
        
        if (file.size > maxFileSize) {
            fileErrors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max: ${maxFileSize / 1024 / 1024}MB)`);
        }
        
        if (fileErrors.length > 0) {
            errors.push(`File ${index + 1} (${file.name}): ${fileErrors.join(', ')}`);
        } else {
            validFiles.push(file);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors,
        validFiles,
        totalFiles: files.length,
        validCount: validFiles.length
    };
};

/**
 * Batch operation presets
 */
export const BATCH_PRESETS = {
    'social-media': {
        operation: 'resize',
        options: {
            width: 1080,
            height: 1080,
            maintainAspectRatio: false,
            quality: 0.9
        }
    },
    'web-optimized': {
        operation: 'compress',
        options: {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080
        }
    },
    'thumbnail': {
        operation: 'resize',
        options: {
            width: 300,
            height: 300,
            maintainAspectRatio: true,
            quality: 0.9
        }
    },
    'watermark-batch': {
        operation: 'watermark',
        options: {
            type: 'text',
            text: 'MemeStack',
            position: 'bottom-right',
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }
    }
};
