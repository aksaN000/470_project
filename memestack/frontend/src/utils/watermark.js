// 🏷️ Watermark Utility Functions
// Handles adding watermarks to images

/**
 * Add text watermark to an image
 * @param {HTMLImageElement} image - Source image
 * @param {Object} options - Watermark options
 * @returns {Promise<Blob>} - Watermarked image blob
 */
export const addTextWatermark = (image, options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const {
                text = 'MemeStack',
                fontSize = 24,
                fontFamily = 'Arial',
                color = 'rgba(255, 255, 255, 0.8)',
                position = 'bottom-right',
                padding = 20,
                backgroundColor = 'rgba(0, 0, 0, 0.3)',
                borderRadius = 5,
                rotation = 0
            } = options;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to match image
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Configure text style
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            // Measure text dimensions
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;

            // Calculate position
            let x, y;
            switch (position) {
                case 'top-left':
                    x = padding;
                    y = padding;
                    break;
                case 'top-right':
                    x = canvas.width - textWidth - padding;
                    y = padding;
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvas.height - textHeight - padding;
                    break;
                case 'bottom-right':
                    x = canvas.width - textWidth - padding;
                    y = canvas.height - textHeight - padding;
                    break;
                case 'center':
                    x = (canvas.width - textWidth) / 2;
                    y = (canvas.height - textHeight) / 2;
                    break;
                default:
                    x = canvas.width - textWidth - padding;
                    y = canvas.height - textHeight - padding;
            }

            // Save context and apply rotation if needed
            ctx.save();
            if (rotation !== 0) {
                const centerX = x + textWidth / 2;
                const centerY = y + textHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
            }

            // Draw background rectangle if specified
            if (backgroundColor && backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(
                    x - 5,
                    y - 5,
                    textWidth + 10,
                    textHeight + 10
                );
                
                if (borderRadius > 0) {
                    ctx.beginPath();
                    ctx.roundRect(x - 5, y - 5, textWidth + 10, textHeight + 10, borderRadius);
                    ctx.fill();
                }
            }

            // Draw the text
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            // Restore context
            ctx.restore();

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create watermarked image'));
                }
            }, 'image/png', 0.9);

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Add image watermark to an image
 * @param {HTMLImageElement} image - Source image
 * @param {HTMLImageElement} watermarkImage - Watermark image
 * @param {Object} options - Watermark options
 * @returns {Promise<Blob>} - Watermarked image blob
 */
export const addImageWatermark = (image, watermarkImage, options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const {
                position = 'bottom-right',
                size = 'small', // small, medium, large, custom
                customWidth = null,
                customHeight = null,
                opacity = 0.8,
                padding = 20,
                rotation = 0
            } = options;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to match image
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Calculate watermark dimensions
            let watermarkWidth, watermarkHeight;
            
            if (size === 'custom' && customWidth && customHeight) {
                watermarkWidth = customWidth;
                watermarkHeight = customHeight;
            } else {
                // Calculate based on size preset
                const scale = {
                    small: 0.1,
                    medium: 0.15,
                    large: 0.2
                }[size] || 0.1;
                
                const maxDimension = Math.max(image.width, image.height);
                const scaledSize = maxDimension * scale;
                
                // Maintain aspect ratio
                const aspectRatio = watermarkImage.width / watermarkImage.height;
                if (watermarkImage.width > watermarkImage.height) {
                    watermarkWidth = scaledSize;
                    watermarkHeight = scaledSize / aspectRatio;
                } else {
                    watermarkHeight = scaledSize;
                    watermarkWidth = scaledSize * aspectRatio;
                }
            }

            // Calculate position
            let x, y;
            switch (position) {
                case 'top-left':
                    x = padding;
                    y = padding;
                    break;
                case 'top-right':
                    x = canvas.width - watermarkWidth - padding;
                    y = padding;
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvas.height - watermarkHeight - padding;
                    break;
                case 'bottom-right':
                    x = canvas.width - watermarkWidth - padding;
                    y = canvas.height - watermarkHeight - padding;
                    break;
                case 'center':
                    x = (canvas.width - watermarkWidth) / 2;
                    y = (canvas.height - watermarkHeight) / 2;
                    break;
                default:
                    x = canvas.width - watermarkWidth - padding;
                    y = canvas.height - watermarkHeight - padding;
            }

            // Save context and apply transformations
            ctx.save();
            ctx.globalAlpha = opacity;

            // Apply rotation if needed
            if (rotation !== 0) {
                const centerX = x + watermarkWidth / 2;
                const centerY = y + watermarkHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
            }

            // Draw the watermark image
            ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);

            // Restore context
            ctx.restore();

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create watermarked image'));
                }
            }, 'image/png', 0.9);

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Create a diagonal repeating watermark pattern
 * @param {HTMLImageElement} image - Source image
 * @param {string} text - Watermark text
 * @param {Object} options - Watermark options
 * @returns {Promise<Blob>} - Watermarked image blob
 */
export const addPatternWatermark = (image, text, options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const {
                fontSize = 20,
                fontFamily = 'Arial',
                color = 'rgba(255, 255, 255, 0.1)',
                spacing = 150,
                rotation = -45
            } = options;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to match image
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Configure text style
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Save context
            ctx.save();

            // Apply rotation
            ctx.rotate((rotation * Math.PI) / 180);

            // Calculate how many repetitions we need
            const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
            const repetitions = Math.ceil(diagonal / spacing);

            // Draw repeating watermarks
            for (let i = -repetitions; i <= repetitions; i++) {
                for (let j = -repetitions; j <= repetitions; j++) {
                    const x = i * spacing;
                    const y = j * spacing;
                    ctx.fillText(text, x, y);
                }
            }

            // Restore context
            ctx.restore();

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create watermarked image'));
                }
            }, 'image/png', 0.9);

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Load an image from a URL or File
 * @param {string|File} source - Image source
 * @returns {Promise<HTMLImageElement>} - Loaded image
 */
export const loadImage = (source) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(source);
        } else {
            img.src = source;
        }
    });
};

/**
 * Convert blob to File object
 * @param {Blob} blob - Source blob
 * @param {string} filename - Desired filename
 * @returns {File} - File object
 */
export const blobToFile = (blob, filename) => {
    return new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now()
    });
};

/**
 * Watermark preset configurations
 */
export const WATERMARK_PRESETS = {
    subtle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        position: 'bottom-right',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 15
    },
    prominent: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.9)',
        position: 'bottom-right',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20
    },
    center: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 0.3)',
        position: 'center',
        backgroundColor: 'transparent',
        padding: 0
    },
    pattern: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.08)',
        spacing: 120,
        rotation: -45
    }
};

/**
 * Common watermark positions
 */
export const WATERMARK_POSITIONS = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'center', label: 'Center' }
];
