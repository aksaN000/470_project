// 🎨 Color Scheme Selector Component
// Allows users to choose from different color schemes

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Fade,
} from '@mui/material';
import {
    Palette as PaletteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

const ColorSchemeSelector = ({ open, onClose }) => {
    const { colorScheme, colorSchemes, mode, setThemeColorScheme } = useThemeMode();

    const handleSchemeSelect = (scheme) => {
        setThemeColorScheme(scheme);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <PaletteIcon sx={{ color: '#ec4899' }} />
                Choose Color Scheme
                <IconButton
                    onClick={onClose}
                    sx={{ ml: 'auto' }}
                    size="small"
                >
                    <CloseIcon sx={{ color: 'text.primary' }} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select a color scheme that suits your style. Changes apply instantly across the entire application.
                </Typography>

                <Grid container spacing={2}>
                    {Object.entries(colorSchemes).map(([key, scheme]) => {
                        const isSelected = colorScheme === key;
                        const schemeColors = scheme[mode];
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <Fade in timeout={300}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            border: isSelected ? `2px solid ${schemeColors.primary}` : '2px solid transparent',
                                            position: 'relative',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                                boxShadow: 4,
                                            }
                                        }}
                                        onClick={() => handleSchemeSelect(key)}
                                    >
                                        {isSelected && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    zIndex: 1,
                                                    bgcolor: schemeColors.primary,
                                                    borderRadius: '50%',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                                            </Box>
                                        )}

                                        <CardContent sx={{ p: 2 }}>
                                            {/* Color Preview */}
                                            <Box sx={{ mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        height: 60,
                                                        borderRadius: 2,
                                                        background: schemeColors.background || 
                                                            `linear-gradient(135deg, ${schemeColors.primary} 0%, ${schemeColors.secondary} 100%)`,
                                                        mb: 1,
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {/* Glassmorphism preview */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            left: 8,
                                                            right: 8,
                                                            bottom: 8,
                                                            background: schemeColors.surface,
                                                            backdropFilter: 'blur(10px)',
                                                            borderRadius: 1,
                                                            border: `1px solid rgba(255, 255, 255, 0.2)`,
                                                        }}
                                                    />
                                                </Box>

                                                {/* Color Dots */}
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: schemeColors.primary,
                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: schemeColors.secondary,
                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Typography
                                                variant="subtitle2"
                                                align="center"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {scheme.name}
                                            </Typography>

                                            {isSelected && (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    sx={{
                                                        mt: 1,
                                                        width: '100%',
                                                        bgcolor: schemeColors.primary,
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Tip: You can change color schemes anytime from settings
                </Typography>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColorSchemeSelector;
