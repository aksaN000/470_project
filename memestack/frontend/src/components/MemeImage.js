// 🖼️ Image Component with Fallback for Broken URLs
// Add this to handle broken images gracefully

import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { BrokenImage, Refresh } from '@mui/icons-material';

const MemeImage = ({ src, alt, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const handleImageError = () => {
        console.log('Image failed to load:', src);
        setImageError(true);
    };

    const handleRetry = () => {
        setImageError(false);
        setRetryCount(prev => prev + 1);
    };

    const isOldBrokenUrl = src && (
        src.includes('localhost:5000') || 
        src.includes('470-project.vercel.app/uploads') ||
        src.startsWith('/uploads')
    );

    if (imageError || isOldBrokenUrl) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                    backgroundColor: 'grey.100',
                    color: 'grey.600',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 2,
                    ...props.sx
                }}
            >
                <BrokenImage sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2" align="center" gutterBottom>
                    {isOldBrokenUrl ? 'Legacy image no longer available' : 'Image failed to load'}
                </Typography>
                <Typography variant="caption" color="grey.500" align="center" sx={{ mb: 1 }}>
                    This image was uploaded before our system upgrade
                </Typography>
                {!isOldBrokenUrl && (
                    <IconButton size="small" onClick={handleRetry}>
                        <Refresh />
                    </IconButton>
                )}
            </Box>
        );
    }

    return (
        <img
            src={`${src}?retry=${retryCount}`}
            alt={alt}
            onError={handleImageError}
            {...props}
        />
    );
};

export default MemeImage;
