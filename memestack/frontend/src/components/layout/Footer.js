// 🦶 Footer Component - Social media footer with links and information

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Link,
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
    const { mode, currentThemeColors } = useThemeMode();
    
    // Fallback colors if currentThemeColors is undefined
    const themeColors = currentThemeColors || {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899'
    };

    return (
        <Box
            component="footer"
            sx={{
                background: mode === 'light' 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)`
                    : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                backdropFilter: 'blur(20px)',
                borderTop: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: mode === 'light' 
                    ? '0 -4px 20px rgba(0, 0, 0, 0.1)'
                    : '0 -8px 32px rgba(0, 0, 0, 0.5)',
                color: mode === 'light' ? '#1f2937' : 'white',
                mt: 'auto',
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: mode === 'light' 
                        ? `
                            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
                        `
                        : `
                            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
                        `,
                    animation: 'floatingBoxes 8s ease-in-out infinite',
                    pointerEvents: 'none',
                },
                '@keyframes floatingBoxes': {
                    '0%, 100%': { 
                        transform: 'translateY(0px) translateX(0px) rotate(0deg)',
                        opacity: 0.6
                    },
                    '33%': { 
                        transform: 'translateY(-15px) translateX(10px) rotate(120deg)',
                        opacity: 0.8
                    },
                    '66%': { 
                        transform: 'translateY(10px) translateX(-15px) rotate(240deg)',
                        opacity: 0.4
                    },
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Main Footer Content - Similar to Navbar Layout */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 4 },
                        mb: { xs: 3, sm: 4 }
                    }}
                >
                    {/* Left Side - Brand Section (like Navbar logo) */}
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 800,
                                color: mode === 'light' ? '#1f2937' : '#ffffff',
                                textShadow: mode === 'light' 
                                    ? '0 2px 4px rgba(0,0,0,0.1)' 
                                    : '0 2px 4px rgba(0,0,0,0.3)',
                                position: 'relative',
                                display: 'inline-block',
                                mb: 2,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s ease',
                                    filter: mode === 'light' 
                                        ? 'drop-shadow(0 0 8px rgba(99,102,241,0.3))'
                                        : 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
                                },
                            }}
                        >
                            🎨 MemeStack
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: mode === 'light' 
                                    ? 'rgba(31,41,55,0.8)' 
                                    : 'rgba(255,255,255,0.9)',
                                lineHeight: 1.6,
                                maxWidth: '400px',
                                textShadow: mode === 'light' 
                                    ? '0 1px 2px rgba(0,0,0,0.05)' 
                                    : '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                        >
                            The ultimate platform for meme creators, featuring collaborative tools, 
                            AI-powered templates, and a vibrant community of digital artists.
                        </Typography>
                    </Box>

                    {/* Right Side - Navigation Links (like Navbar menu) */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            gap: { xs: 3, sm: 4, md: 6 },
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'flex-start' }
                        }}
                    >
                        {/* Explore Section */}
                        <Box sx={{ minWidth: '120px' }}>
                            <Typography 
                                variant="subtitle2" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 700,
                                    color: mode === 'light' ? '#1f2937' : '#ffffff',
                                    textShadow: mode === 'light' 
                                        ? '0 2px 4px rgba(0,0,0,0.1)' 
                                        : '0 2px 4px rgba(0,0,0,0.3)',
                                    fontSize: '0.9rem',
                                    mb: 2,
                                }}
                            >
                                Explore
                            </Typography>
                            <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {[
                                    { label: 'Templates', href: '/templates' },
                                    { label: 'Community', href: '/community' },
                                    { label: 'Collaborations', href: '/collaborations' },
                                ].map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        color="inherit"
                                        underline="none"
                                        sx={{
                                            color: mode === 'light' 
                                                ? 'rgba(31,41,55,0.7)' 
                                                : 'rgba(255,255,255,0.8)',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            '&:hover': {
                                                color: mode === 'light' ? '#1f2937' : '#ffffff',
                                                textShadow: mode === 'light' 
                                                    ? '0 0 8px rgba(99,102,241,0.4)' 
                                                    : '0 0 8px rgba(255,255,255,0.6)',
                                                transform: 'translateX(4px)',
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: -12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 0,
                                                height: 2,
                                                backgroundColor: mode === 'light' 
                                                    ? 'rgba(99,102,241,0.6)' 
                                                    : 'rgba(255,255,255,0.6)',
                                                transition: 'width 0.3s ease',
                                            },
                                            '&:hover::before': {
                                                width: 8,
                                            },
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </Box>
                        </Box>

                        {/* Connect Section */}
                        <Box sx={{ minWidth: '140px' }}>
                            <Typography 
                                variant="subtitle2" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 700,
                                    color: mode === 'light' ? '#1f2937' : '#ffffff',
                                    textShadow: mode === 'light' 
                                        ? '0 2px 4px rgba(0,0,0,0.1)' 
                                        : '0 2px 4px rgba(0,0,0,0.3)',
                                    fontSize: '0.9rem',
                                    mb: 2,
                                }}
                            >
                                Connect
                            </Typography>
                            
                            {/* Social Media Icons */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                <IconButton
                                    href="https://github.com/memestack"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        color: mode === 'light' ? '#24292e' : '#ffffff',
                                        '&:hover': {
                                            backgroundColor: mode === 'light' 
                                                ? 'rgba(36,41,46,0.1)' 
                                                : 'rgba(255,255,255,0.1)',
                                            transform: 'scale(1.1) rotate(5deg)',
                                            transition: 'all 0.3s ease',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '1.25rem',
                                            filter: mode === 'light' 
                                                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' 
                                                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                        },
                                    }}
                                >
                                    <GitHubIcon />
                                </IconButton>
                                <IconButton
                                    href="https://linkedin.com/company/memestack"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        color: '#0077b5',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,119,181,0.1)',
                                            transform: 'scale(1.1) rotate(-5deg)',
                                            transition: 'all 0.3s ease',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '1.25rem',
                                            filter: mode === 'light' 
                                                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' 
                                                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                        },
                                    }}
                                >
                                    <LinkedInIcon />
                                </IconButton>
                                <IconButton
                                    href="https://twitter.com/memestack"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        color: '#1da1f2',
                                        '&:hover': {
                                            backgroundColor: 'rgba(29,161,242,0.1)',
                                            transform: 'scale(1.1) rotate(5deg)',
                                            transition: 'all 0.3s ease',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '1.25rem',
                                            filter: mode === 'light' 
                                                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' 
                                                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                        },
                                    }}
                                >
                                    <TwitterIcon />
                                </IconButton>
                            </Box>

                            {/* Additional Links */}
                            <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {[
                                    { label: 'Support', href: '/support' },
                                    { label: 'Privacy', href: '/privacy' },
                                    { label: 'Terms', href: '/terms' },
                                ].map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        color="inherit"
                                        underline="none"
                                        sx={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            '&:hover': {
                                                color: '#ffffff',
                                                textShadow: '0 0 8px rgba(255,255,255,0.6)',
                                                transform: 'translateX(4px)',
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: -12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 0,
                                                height: 2,
                                                backgroundColor: 'rgba(255,255,255,0.6)',
                                                transition: 'width 0.3s ease',
                                            },
                                            '&:hover::before': {
                                                width: 8,
                                            },
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider 
                    sx={{ 
                        my: { xs: 2, sm: 3 },
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }} 
                />

                {/* Bottom Section */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        textAlign: { xs: 'center', sm: 'left' },
                    }}
                >
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
                            fontSize: '0.875rem',
                            textShadow: mode === 'light' 
                                ? '0 1px 2px rgba(0,0,0,0.05)' 
                                : '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                    >
                        © {currentYear} MemeStack. All rights reserved.
                    </Typography>
                    
                    <Box 
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontSize: '0.875rem',
                                textShadow: mode === 'light' 
                                    ? '0 1px 2px rgba(0,0,0,0.05)' 
                                    : '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                        >
                            Made with
                        </Typography>
                        <FavoriteIcon 
                            sx={{
                                fontSize: '1rem',
                                color: '#ef4444',
                                animation: 'heartbeat 2s ease-in-out infinite',
                                filter: mode === 'light' 
                                    ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' 
                                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                '@keyframes heartbeat': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.1)' },
                                    '100%': { transform: 'scale(1)' },
                                },
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontSize: '0.875rem',
                                textShadow: mode === 'light' 
                                    ? '0 1px 2px rgba(0,0,0,0.05)' 
                                    : '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                        >
                            for the meme community
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;