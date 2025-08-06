// 🔧 Theme Debug Component
// Shows current theme colors for development

import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';

const ThemeDebug = ({ show = false }) => {
    const { mode, colorScheme, currentThemeColors } = useThemeMode();

    if (!show) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                p: 2,
                zIndex: 9999,
                minWidth: 200,
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: 2,
                fontSize: '0.75rem',
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                Theme Debug
            </Typography>
            
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption">Mode: {mode}</Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption">Scheme: {colorScheme}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Chip
                    size="small"
                    label="Primary"
                    sx={{
                        bgcolor: currentThemeColors?.primary,
                        color: 'white',
                        fontSize: '0.6rem',
                        height: 20,
                    }}
                />
                <Chip
                    size="small"
                    label="Secondary"
                    sx={{
                        bgcolor: currentThemeColors?.secondary,
                        color: 'white',
                        fontSize: '0.6rem',
                        height: 20,
                    }}
                />
            </Box>
        </Paper>
    );
};

export default ThemeDebug;
