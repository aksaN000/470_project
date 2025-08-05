// 🦶 Footer Component
// Bottom footer with links and information

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Link,
    Grid,
    IconButton,
    Divider,
} from '@mui/material';
import {
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { mode } = useThemeMode();

    return (
        <Box
            component="footer"
            sx={{
                background: mode === 'light' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                color: 'white',
                mt: 'auto',
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    animation: 'wave 3s linear infinite',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
                                radial-gradient(circle at 40% 40%, rgba(255,255,255,0.04) 0%, transparent 50%)`,
                    pointerEvents: 'none',
                },
                '@keyframes wave': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' },
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center" alignItems="flex-start">
                    {/* Brand Section */}
                    <Grid item xs={12} md={7}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 800,
                                color: '#ffffff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                position: 'relative',
                                display: 'inline-block',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s ease',
                                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
                                },
                            }}
                        >
                            🎭 MemeStack
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                opacity: 0.9, 
                                mb: 3,
                                lineHeight: 1.6,
                                color: 'rgba(255, 255, 255, 0.9)',
                            }}
                        >
                            The ultimate platform for meme creators and enthusiasts. 
                            Create, share, and discover the best memes on the internet.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <IconButton 
                                color="inherit" 
                                sx={{ 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    width: 48,
                                    height: 48,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        transform: 'translateY(-4px) rotate(5deg)',
                                        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)',
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                    },
                                }}
                                href="https://github.com"
                                target="_blank"
                            >
                                <GitHubIcon />
                            </IconButton>
                            <IconButton 
                                color="inherit" 
                                sx={{ 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    width: 48,
                                    height: 48,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'rgba(0, 119, 181, 0.3)',
                                        transform: 'translateY(-4px) rotate(-5deg)',
                                        boxShadow: '0 12px 25px rgba(0, 119, 181, 0.3)',
                                        borderColor: '#0077b5',
                                    },
                                }}
                                href="https://linkedin.com"
                                target="_blank"
                            >
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton 
                                color="inherit" 
                                sx={{ 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    width: 48,
                                    height: 48,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'rgba(29, 161, 242, 0.3)',
                                        transform: 'translateY(-4px) rotate(5deg)',
                                        boxShadow: '0 12px 25px rgba(29, 161, 242, 0.3)',
                                        borderColor: '#1da1f2',
                                    },
                                }}
                                href="https://twitter.com"
                                target="_blank"
                            >
                                <TwitterIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 700,
                                color: '#ffffff',
                                position: 'relative',
                                mb: 2,
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: 0,
                                    width: '30px',
                                    height: '2px',
                                    background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                                    borderRadius: '2px',
                                },
                            }}
                        >
                            Platform
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Link 
                                href="/gallery" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Browse Memes
                            </Link>
                            <Link 
                                href="/create" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Create Meme
                            </Link>
                            <Link 
                                href="/dashboard" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Dashboard
                            </Link>
                        </Box>
                    </Grid>

                    {/* Support */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 700,
                                color: '#ffffff',
                                position: 'relative',
                                mb: 2,
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: 0,
                                    width: '30px',
                                    height: '2px',
                                    background: 'linear-gradient(45deg, #8b5cf6, #f472b6)',
                                    borderRadius: '2px',
                                },
                            }}
                        >
                            Support
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Link 
                                href="/help" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #8b5cf6, #f472b6)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Help Center
                            </Link>
                            <Link 
                                href="/contact" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #8b5cf6, #f472b6)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Contact Us
                            </Link>
                            <Link 
                                href="/privacy" 
                                color="inherit" 
                                underline="none"
                                sx={{ 
                                    opacity: 0.9,
                                    transition: 'all 0.3s ease',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    '&:hover': { 
                                        opacity: 1,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateX(8px)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            background: 'linear-gradient(45deg, #8b5cf6, #f472b6)',
                                            borderRadius: '2px',
                                        },
                                    },
                                }}
                            >
                                Privacy Policy
                            </Link>
                        </Box>
                    </Grid>
                </Grid>

                <Divider 
                    sx={{ 
                        my: { xs: 2, md: 3 }, 
                        borderColor: 'rgba(255,255,255,0.15)',
                        opacity: 0.6,
                    }} 
                />

                {/* Bottom Section */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 2, sm: 3 },
                        pt: { xs: 2, md: 3 },
                        position: 'relative',
                    }}
                >
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            opacity: 0.9,
                            fontWeight: 500,
                            color: '#ffffff',
                        }}
                    >
                        © {currentYear} MemeStack. All rights reserved.
                    </Typography>
                    
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            opacity: 0.9,
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#ffffff' }}>
                            Made with
                        </Typography>
                        <FavoriteIcon 
                            sx={{ 
                                fontSize: 18, 
                                color: '#ec4899',
                                animation: 'heartbeat 2s ease-in-out infinite',
                                '@keyframes heartbeat': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.1)' },
                                    '100%': { transform: 'scale(1)' },
                                },
                            }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#ffffff' }}>
                            for meme lovers
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
