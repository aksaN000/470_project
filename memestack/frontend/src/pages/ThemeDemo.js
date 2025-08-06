// 🎨 Theme Demo Page
// Showcases all color schemes and glassmorphism effects

import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Fab,
} from '@mui/material';
import {
    Palette as PaletteIcon,
    Star as StarIcon,
    Favorite as FavoriteIcon,
    Share as ShareIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';
import ColorSchemeSelector from '../components/common/ColorSchemeSelector';
import ThemeDebug from '../components/common/ThemeDebug';

const ThemeDemo = () => {
    const { mode, currentThemeColors, colorScheme, colorSchemes } = useThemeMode();
    const [colorSchemeOpen, setColorSchemeOpen] = useState(false);

    const demoCards = [
        {
            title: "Glassmorphism Card",
            subtitle: "Beautiful transparent effects",
            content: "This card demonstrates the glassmorphism effect with backdrop blur and transparent backgrounds."
        },
        {
            title: "Theme Colors",
            subtitle: "Dynamic color system",
            content: "Colors automatically adapt based on the selected theme scheme and light/dark mode."
        },
        {
            title: "Interactive Elements",
            subtitle: "Buttons and components",
            content: "All interactive elements use the theme colors for consistent styling across the app."
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                    }}
                >
                    {/* Artist Palette Emoji - Separate for Natural Colors */}
                    <Box
                        component="span"
                        sx={{
                            fontSize: 'inherit',
                            filter: 'hue-rotate(0deg) saturate(1.1) brightness(1.05)',
                            '&:hover': {
                                transform: 'scale(1.1) rotate(-10deg)',
                                transition: 'transform 0.3s ease',
                            },
                        }}
                    >
                        🎨
                    </Box>
                    
                    {/* Theme Demo Text with Gradient */}
                    <Box
                        component="span"
                        sx={{
                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            // Fallback for browsers that don't support background-clip
                            '@supports not (-webkit-background-clip: text)': {
                                background: 'none',
                                color: currentThemeColors?.primary || '#6366f1',
                            },
                        }}
                    >
                        Theme Demo
                    </Box>
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
                    Showcasing the enhanced theming system with glassmorphism effects
                </Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                    <Chip 
                        label={`Current: ${colorSchemes[colorScheme]?.name || 'Default'}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip 
                        label={`Mode: ${mode}`}
                        color="secondary"
                        variant="outlined"
                    />
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<PaletteIcon />}
                    onClick={() => setColorSchemeOpen(true)}
                    sx={{
                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                        borderRadius: '16px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                    }}
                >
                    Change Color Scheme
                </Button>
            </Box>

            {/* Background with neutral colors */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
                        `,
                        animation: 'float 8s ease-in-out infinite',
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                            '50%': { transform: 'translateY(-30px) rotate(180deg)' },
                        },
                    },
                }}
            />

            {/* Demo Cards */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {demoCards.map((card, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card
                            sx={{
                                height: '300px',
                                background: currentThemeColors?.surface || 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${currentThemeColors?.border || 'rgba(255, 255, 255, 0.2)'}`,
                                borderRadius: '24px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: `0 20px 40px ${currentThemeColors?.primary || 'rgba(99, 102, 241, 0.2)'}`,
                                    background: currentThemeColors?.surfaceHover || 'rgba(255, 255, 255, 0.15)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2,
                                        color: 'white',
                                    }}
                                >
                                    <StarIcon />
                                </Box>
                                
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {card.title}
                                </Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                    {card.subtitle}
                                </Typography>
                                
                                <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6 }}>
                                    {card.content}
                                </Typography>

                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                    <IconButton size="small" color="primary">
                                        <FavoriteIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="primary">
                                        <ShareIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Interactive Elements Showcase */}
            <Paper
                sx={{
                    p: 4,
                    borderRadius: '24px',
                    background: currentThemeColors?.surface || 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${currentThemeColors?.border || 'rgba(255, 255, 255, 0.2)'}`,
                    mb: 4,
                }}
            >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    Interactive Elements
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Buttons</Typography>
                        <Stack spacing={2}>
                            <Button variant="contained" size="large">
                                Primary Button
                            </Button>
                            <Button variant="outlined" size="large">
                                Outlined Button
                            </Button>
                            <Button variant="text" size="large">
                                Text Button
                            </Button>
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Chips & Avatars</Typography>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip label="Primary" color="primary" />
                                <Chip label="Secondary" color="secondary" />
                                <Chip label="Success" color="success" />
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ bgcolor: currentThemeColors?.primary }}>U</Avatar>
                                <Avatar sx={{ bgcolor: currentThemeColors?.secondary }}>S</Avatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>E</Avatar>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                }}
            >
                <AddIcon />
            </Fab>

            {/* Color Scheme Selector Dialog */}
            <ColorSchemeSelector
                open={colorSchemeOpen}
                onClose={() => setColorSchemeOpen(false)}
            />
        </Container>
    );
};

export default ThemeDemo;
