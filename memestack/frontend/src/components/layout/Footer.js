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

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                mt: 'auto',
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Section */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            🎭 MemeStack
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                            The ultimate platform for meme creators and enthusiasts. 
                            Create, share, and discover the best memes on the internet.
                        </Typography>
                        <Box>
                            <IconButton 
                                color="inherit" 
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                                href="https://github.com"
                                target="_blank"
                            >
                                <GitHubIcon />
                            </IconButton>
                            <IconButton 
                                color="inherit" 
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                                href="https://linkedin.com"
                                target="_blank"
                            >
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton 
                                color="inherit" 
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                                href="https://twitter.com"
                                target="_blank"
                            >
                                <TwitterIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Platform
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link 
                                href="/gallery" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Browse Memes
                            </Link>
                            <Link 
                                href="/create" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Create Meme
                            </Link>
                            <Link 
                                href="/dashboard" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Dashboard
                            </Link>
                        </Box>
                    </Grid>

                    {/* Features */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Features
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Meme Generator
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Social Sharing
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Trending Memes
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                User Profiles
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Support */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Support
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link 
                                href="/help" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Help Center
                            </Link>
                            <Link 
                                href="/contact" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Contact Us
                            </Link>
                            <Link 
                                href="/privacy" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Privacy Policy
                            </Link>
                            <Link 
                                href="/terms" 
                                color="inherit" 
                                underline="hover"
                                sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                            >
                                Terms of Service
                            </Link>
                        </Box>
                    </Grid>

                    {/* Stats */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Stats
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                🎭 1000+ Memes
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                👥 500+ Users
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                ❤️ 10K+ Likes
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                📱 Mobile Ready
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

                {/* Bottom Section */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        © {currentYear} MemeStack. All rights reserved.
                    </Typography>
                    
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            opacity: 0.8,
                        }}
                    >
                        <Typography variant="body2">
                            Made with
                        </Typography>
                        <FavoriteIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="body2">
                            for meme lovers
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
