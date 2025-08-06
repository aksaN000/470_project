// 404 Not Found Page Component
// Error page for invalid routes

import React from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Fade,
    Zoom,
    useTheme,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../contexts/ThemeContext';

const NotFound = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
        }}>
            <Container maxWidth="sm">
                <Fade in={true} timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            background: mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                            backdropFilter: 'blur(50px)',
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.15)'
                                : '2px solid rgba(99, 102, 241, 0.15)',
                            borderTop: mode === 'dark'
                                ? '3px solid rgba(255, 255, 255, 0.25)'
                                : '3px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: mode === 'dark'
                                ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 50%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                            },
                        }}
                    >
                        {/* Animated Emoji */}
                        <Zoom in={true} timeout={1200}>
                            <Typography 
                                variant="h1" 
                                sx={{ 
                                    fontSize: '8rem', 
                                    mb: 3,
                                    lineHeight: 1,
                                    animation: 'float 3s ease-in-out infinite',
                                    '@keyframes float': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            >
                                🤔
                            </Typography>
                        </Zoom>

                        {/* Enhanced Header */}
                        <Typography 
                            variant="h2" 
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                            }}
                        >
                            404 - Page Not Found
                        </Typography>

                        {/* Enhanced Description */}
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 4,
                                fontWeight: 500,
                                lineHeight: 1.6,
                                maxWidth: '400px',
                                mx: 'auto',
                            }}
                        >
                            Oops! The page you're looking for seems to have disappeared into the meme void. 
                            Don't worry, we'll help you get back on track! 🚀
                        </Typography>

                        {/* Enhanced Button */}
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/')}
                            sx={{
                                py: 2,
                                px: 4,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                textTransform: 'none',
                                boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                    boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            Take Me Home
                        </Button>

                        {/* Additional Help Text */}
                        <Box sx={{ mt: 6 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    background: mode === 'dark'
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                                    backdropFilter: 'blur(40px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.12)'
                                        : '2px solid rgba(99, 102, 241, 0.12)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.2)'
                                        : '3px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '16px',
                                }}
                            >
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                    }}
                                >
                                    💡 Try checking the URL for typos, or browse our collection of memes from the homepage.
                                </Typography>
                            </Paper>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
};

export default NotFound;
