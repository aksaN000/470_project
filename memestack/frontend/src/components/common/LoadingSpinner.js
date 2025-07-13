// 🔄 Loading Spinner Component
// Reusable loading indicator

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ 
    message = 'Loading...', 
    size = 40,
    fullScreen = false 
}) => {
    const content = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={3}
        >
            <CircularProgress size={size} />
            <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 500 }}
            >
                {message}
            </Typography>
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 9999,
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
};

export default LoadingSpinner;
