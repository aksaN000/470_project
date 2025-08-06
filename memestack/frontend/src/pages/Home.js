// 🏠 Home Page Component
// Modern landing page showcasing MemeStack features with enhanced UI

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    useTheme,
    Avatar,
    IconButton,
    Fade,
    Slide,
    Zoom,
    Stack,
    Paper,
    LinearProgress,
} from '@mui/material';
import {
    PhotoLibrary as GalleryIcon,
    Add as CreateIcon,
    TrendingUp as TrendingIcon,
    People as CommunityIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    PlayArrow as PlayIcon,
    Star as StarIcon,
    Visibility as ViewIcon,
    Favorite as FavoriteIcon,
    Share as ShareIcon,
    Groups as GroupsIcon,
    EmojiEvents as ChallengeIcon,
    Palette as PaletteIcon,
    Cloud as CloudIcon,
    Smartphone as MobileIcon,
    Analytics as AnalyticsIcon,
    AutoAwesome as AIIcon,
    Code as APIIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMemes } from '../contexts/MemeContext';
import { useThemeMode } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { healthAPI } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isAuthenticated, user } = useAuth();
    const { 
        trendingMemes, 
        loading, 
        fetchTrendingMemes 
    } = useMemes();
    const { mode, currentThemeColors } = useThemeMode();

    const [animationStep, setAnimationStep] = useState(0);
    const [heroVisible, setHeroVisible] = useState(false);

    // Initialize animations
    useEffect(() => {
        setHeroVisible(true);
        const timer = setInterval(() => {
            setAnimationStep(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Fetch trending memes on component mount (force initial load)
    useEffect(() => {
        fetchTrendingMemes(6);
    }, []); // Empty dependency array for initial mount

    // Enhanced features data with more comprehensive descriptions
    const coreFeatures = [
        {
            icon: <CreateIcon sx={{ fontSize: 48, color: '#10b981' }} />,
            title: 'AI-Powered Meme Creation',
            description: 'Create stunning memes with our intelligent editor, featuring smart templates, auto-captioning, and style suggestions.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            stats: '50K+ Templates'
        },
        {
            icon: <GalleryIcon sx={{ fontSize: 48, color: '#f59e0b' }} />,
            title: 'Infinite Discovery',
            description: 'Explore millions of memes with advanced filtering, personalized recommendations, and real-time trending content.',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            stats: '2M+ Memes'
        },
        {
            icon: <CommunityIcon sx={{ fontSize: 48, color: '#6366f1' }} />,
            title: 'Vibrant Community',
            description: 'Connect with fellow creators, join challenges, collaborate on projects, and build your meme empire together.',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            stats: '500K+ Users'
        }
    ];

    const advancedFeatures = [
        {
            icon: <GroupsIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
            title: 'Team Collaboration',
            description: 'Work together on meme projects with real-time editing and version control.',
        },
        {
            icon: <ChallengeIcon sx={{ fontSize: 40, color: '#f59e0b' }} />,
            title: 'Meme Challenges',
            description: 'Participate in daily challenges and win exclusive rewards and recognition.',
        },
        {
            icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
            title: 'Advanced Analytics',
            description: 'Track your meme performance with detailed insights and engagement metrics.',
        },
        {
            icon: <CloudIcon sx={{ fontSize: 40, color: '#06b6d4' }} />,
            title: 'Cloud Storage',
            description: 'Never lose your creations with unlimited cloud storage and backup.',
        },
        {
            icon: <MobileIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
            title: 'Mobile First',
            description: 'Create and share memes on the go with our responsive mobile experience.',
        },
        {
            icon: <APIIcon sx={{ fontSize: 40, color: '#10b981' }} />,
            title: 'Developer API',
            description: 'Integrate MemeStack into your applications with our comprehensive API.',
        },
    ];

    // Platform statistics
    const stats = [
        { label: 'Active Users', value: '500K+', icon: <CommunityIcon />, color: currentThemeColors?.primary || '#6366f1' },
        { label: 'Memes Created', value: '2M+', icon: <CreateIcon />, color: currentThemeColors?.secondary || '#ec4899' },
        { label: 'Daily Views', value: '10M+', icon: <ViewIcon />, color: '#10b981' },
        { label: 'Countries', value: '150+', icon: <StarIcon />, color: '#f59e0b' },
    ];

    return (
        <Box>
            {/* Enhanced Hero Section with Animated Background */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    background: `
                        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%),
                        linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'} 0%, ${theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc'} 100%)
                    `,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
                        `,
                        animation: 'float 6s ease-in-out infinite',
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
                        },
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Fade in={heroVisible} timeout={1000}>
                                <Box>
                                    <Typography
                                        variant="h1"
                                        component="h1"
                                        sx={{
                                            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                                            fontWeight: 800,
                                            mb: 2,
                                            lineHeight: 1.1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: { xs: 1, sm: 2 },
                                            justifyContent: { xs: 'center', sm: 'flex-start' },
                                        }}
                                    >
                                        {/* Theater Masks Emoji - Separate for Natural Colors */}
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                                                filter: 'hue-rotate(15deg) saturate(1.2) brightness(1.1)',
                                                '&:hover': {
                                                    transform: 'scale(1.1) rotate(5deg)',
                                                    transition: 'transform 0.3s ease',
                                                },
                                            }}
                                        >
                                            🎭
                                        </Box>
                                        
                                        {/* MemeStack Text with Gradient */}
                                        <Box
                                            component="span"
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 50%, #10b981 100%)`,
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                color: 'transparent',
                                                backgroundSize: '200% 200%',
                                                animation: 'logoGradient 3s ease infinite',
                                                '@keyframes logoGradient': {
                                                    '0%': { backgroundPosition: '0% 50%' },
                                                    '50%': { backgroundPosition: '100% 50%' },
                                                    '100%': { backgroundPosition: '0% 50%' },
                                                },
                                                // Fallback for browsers that don't support background-clip
                                                '@supports not (-webkit-background-clip: text)': {
                                                    background: 'none',
                                                    color: currentThemeColors?.primary || '#6366f1',
                                                },
                                            }}
                                        >
                                            MemeStack
                                        </Box>
                                    </Typography>
                                    
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontSize: { xs: '1.5rem', md: '2rem' },
                                            fontWeight: 600,
                                            mb: 3,
                                            opacity: 0.9,
                                            background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                        }}
                                    >
                                        The Ultimate Meme Creation Platform
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                                            opacity: 0.8,
                                            mb: 4,
                                            lineHeight: 1.6,
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        Create viral memes with AI-powered tools, connect with millions of creators, 
                                        and share your humor with the world. Join the meme revolution today!
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                                        {isAuthenticated ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<CreateIcon />}
                                                    onClick={() => navigate('/create')}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                                                        fontWeight: 600,
                                                        px: 4,
                                                        py: 2,
                                                        borderRadius: '16px',
                                                        textTransform: 'none',
                                                        fontSize: '1.1rem',
                                                        boxShadow: `0 8px 32px ${currentThemeColors?.primary || 'rgba(99, 102, 241, 0.3)'}`,
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Create Your First Meme
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<GalleryIcon />}
                                                    onClick={() => navigate('/dashboard')}
                                                    sx={{
                                                        borderColor: theme.palette.primary.main,
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        px: 4,
                                                        py: 2,
                                                        borderRadius: '16px',
                                                        textTransform: 'none',
                                                        fontSize: '1.1rem',
                                                        borderWidth: '2px',
                                                        '&:hover': {
                                                            borderWidth: '2px',
                                                            transform: 'translateY(-2px)',
                                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Go to Dashboard
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={() => navigate('/register')}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                                                        fontWeight: 600,
                                                        px: 4,
                                                        py: 2,
                                                        borderRadius: '16px',
                                                        textTransform: 'none',
                                                        fontSize: '1.1rem',
                                                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Start Creating Free
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<GalleryIcon />}
                                                    onClick={() => navigate('/gallery')}
                                                    sx={{
                                                        borderColor: theme.palette.primary.main,
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        px: 4,
                                                        py: 2,
                                                        borderRadius: '16px',
                                                        textTransform: 'none',
                                                        fontSize: '1.1rem',
                                                        borderWidth: '2px',
                                                        '&:hover': {
                                                            borderWidth: '2px',
                                                            transform: 'translateY(-2px)',
                                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Explore Gallery
                                                </Button>
                                            </>
                                        )}
                                    </Stack>

                                    {/* Live Statistics */}
                                    <Grid container spacing={3} sx={{ mt: 2 }}>
                                        {stats.map((stat, index) => (
                                            <Grid item xs={6} sm={3} key={index}>
                                                <Zoom in={heroVisible} timeout={1000 + index * 200}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            textAlign: 'center',
                                                            background: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                                : 'rgba(255, 255, 255, 0.9)',
                                                            backdropFilter: 'blur(20px)',
                                                            border: theme.palette.mode === 'dark'
                                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                                : '1px solid rgba(99, 102, 241, 0.1)',
                                                            borderRadius: '20px',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                transform: 'translateY(-8px)',
                                                                background: theme.palette.mode === 'dark'
                                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                                    : 'rgba(255, 255, 255, 1)',
                                                                boxShadow: theme.palette.mode === 'dark'
                                                                    ? '0 20px 40px rgba(99, 102, 241, 0.2)'
                                                                    : '0 20px 40px rgba(99, 102, 241, 0.15)',
                                                                borderColor: theme.palette.mode === 'dark'
                                                                    ? 'rgba(99, 102, 241, 0.3)'
                                                                    : 'rgba(99, 102, 241, 0.2)',
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ 
                                                            color: theme.palette.primary.main, 
                                                            mb: 1.5,
                                                            '& svg': {
                                                                fontSize: '2rem'
                                                            }
                                                        }}>
                                                            {stat.icon}
                                                        </Box>
                                                        <Typography 
                                                            variant="h5" 
                                                            sx={{ 
                                                                fontWeight: 700, 
                                                                color: theme.palette.primary.main,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {stat.value}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                opacity: 0.7,
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {stat.label}
                                                        </Typography>
                                                    </Paper>
                                                </Zoom>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Fade>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Slide direction="left" in={heroVisible} timeout={1200}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: { xs: '300px', md: '500px' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {/* Animated Meme Preview Cards */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            '& .preview-card': {
                                                position: 'absolute',
                                                width: '200px',
                                                height: '200px',
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '3rem',
                                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                                                transition: 'all 0.5s ease',
                                            },
                                        }}
                                    >
                                        <Box
                                            className="preview-card"
                                            sx={{
                                                top: '10%',
                                                left: '10%',
                                                transform: animationStep === 0 ? 'scale(1.1) rotate(-10deg)' : 'scale(0.9) rotate(-5deg)',
                                                zIndex: animationStep === 0 ? 3 : 1,
                                            }}
                                        >
                                            😂
                                        </Box>
                                        <Box
                                            className="preview-card"
                                            sx={{
                                                top: '30%',
                                                right: '10%',
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                transform: animationStep === 1 ? 'scale(1.1) rotate(10deg)' : 'scale(0.9) rotate(5deg)',
                                                zIndex: animationStep === 1 ? 3 : 1,
                                            }}
                                        >
                                            <Box 
                                                sx={{ 
                                                    filter: 'hue-rotate(10deg) saturate(1.3) brightness(1.2)',
                                                    fontSize: '3rem'
                                                }}
                                            >
                                                🎭
                                            </Box>
                                        </Box>
                                        <Box
                                            className="preview-card"
                                            sx={{
                                                bottom: '10%',
                                                left: '30%',
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                transform: animationStep === 2 ? 'scale(1.1) rotate(-5deg)' : 'scale(0.9) rotate(0deg)',
                                                zIndex: animationStep === 2 ? 3 : 1,
                                            }}
                                        >
                                            🚀
                                        </Box>
                                    </Box>
                                </Box>
                            </Slide>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Core Features Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Fade in={true} timeout={1000}>
                    <Box textAlign="center" sx={{ mb: 8 }}>
                        <Typography
                            variant="h2"
                            component="h2"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                mb: 2,
                            }}
                        >
                            Powerful Features for Every Creator
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: theme.palette.text.secondary,
                                maxWidth: '600px',
                                mx: 'auto',
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                            }}
                        >
                            Everything you need to create, share, and discover amazing memes
                        </Typography>
                    </Box>
                </Fade>

                <Grid container spacing={4}>
                    {coreFeatures.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Zoom in={true} timeout={1000 + index * 200}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: currentThemeColors?.surface || (theme.palette.mode === 'dark' 
                                            ? 'rgba(255, 255, 255, 0.05)' 
                                            : 'rgba(255, 255, 255, 0.9)'),
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${currentThemeColors?.primary || (theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(99, 102, 241, 0.1)')}`,
                                        borderRadius: '24px',
                                        overflow: 'visible',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-12px)',
                                            background: currentThemeColors?.surfaceHover || (theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)'),
                                            boxShadow: `0 25px 60px ${currentThemeColors?.primary || 'rgba(99, 102, 241, 0.3)'}`,
                                            borderColor: currentThemeColors?.primary || 'rgba(99, 102, 241, 0.4)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                            {React.cloneElement(feature.icon, {
                                sx: {
                                    fontSize: 60,
                                    color: index === 0 ? '#10b981' : // Green for Create
                                           index === 1 ? '#6366f1' : // Blue for Gallery  
                                           '#ec4899' // Pink for Community
                                }
                            })}
                        </Box>                                        <Typography 
                                            variant="h5" 
                                            component="h3" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                mb: 2,
                                                color: theme.palette.text.primary
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                opacity: 0.8, 
                                                lineHeight: 1.6,
                                                mb: 3,
                                                color: theme.palette.text.secondary
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>

                                        <Chip
                                            label={feature.stats}
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                color: 'white',
                                                fontWeight: 600,
                                                border: 'none',
                                                '& .MuiChip-label': {
                                                    color: 'white'
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Advanced Features Grid */}
            <Box sx={{ 
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                py: { xs: 8, md: 12 } 
            }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" sx={{ mb: 8 }}>
                        <Typography
                            variant="h3"
                            component="h2"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 700,
                                mb: 2,
                                color: theme.palette.text.primary,
                            }}
                        >
                            Advanced Tools & Features
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: theme.palette.text.secondary,
                                maxWidth: '500px',
                                mx: 'auto',
                            }}
                        >
                            Professional-grade tools for serious meme creators
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {advancedFeatures.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Slide direction="up" in={true} timeout={1000 + index * 100}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            background: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(20px)',
                                            border: theme.palette.mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : '1px solid rgba(99, 102, 241, 0.1)',
                                            borderRadius: '16px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                background: theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                    : 'rgba(255, 255, 255, 1)',
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? '0 20px 60px rgba(99, 102, 241, 0.3)'
                                                    : '0 20px 60px rgba(99, 102, 241, 0.2)',
                                                borderColor: theme.palette.mode === 'dark'
                                                    ? 'rgba(99, 102, 241, 0.4)'
                                                    : 'rgba(99, 102, 241, 0.3)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                                                {React.cloneElement(feature.icon, {
                                                    sx: {
                                                        fontSize: 40,
                                                        color: index === 0 ? '#8b5cf6' : // Purple for Groups
                                               index === 1 ? '#f59e0b' : // Yellow for Challenges  
                                               index === 2 ? '#6366f1' : // Blue for Analytics
                                               index === 3 ? '#10b981' : // Green for Cloud
                                               index === 4 ? '#ec4899' : // Pink for Mobile
                                               '#f97316' // Orange for API
                                                    }
                                                })}
                                            </Box>
                                            
                                            <Typography 
                                                variant="h6" 
                                                component="h3" 
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    mb: 1,
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                            
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    lineHeight: 1.6,
                                                    color: theme.palette.text.secondary
                                                }}
                                            >
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Slide>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Enhanced Trending Memes Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 6,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 3,
                    }}
                >
                    <Box>
                        <Typography 
                            variant="h3" 
                            component="h2"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 700,
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            {/* Fire Emoji - Separate for Natural Colors */}
                            <Box
                                component="span"
                                sx={{
                                    fontSize: 'inherit',
                                    filter: 'hue-rotate(5deg) saturate(1.2) brightness(1.1)',
                                    '&:hover': {
                                        transform: 'scale(1.15) rotate(5deg)',
                                        transition: 'transform 0.3s ease',
                                    },
                                }}
                            >
                                🔥
                            </Box>
                            
                            {/* Trending Now Text with Gradient */}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    // Fallback for browsers that don't support background-clip
                                    '@supports not (-webkit-background-clip: text)': {
                                        background: 'none',
                                        color: '#f59e0b',
                                    },
                                }}
                            >
                                Trending Now
                            </Box>
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Discover what's going viral in the meme world
                        </Typography>
                    </Box>
                    
                    <Button
                        variant="contained"
                        onClick={() => navigate('/gallery')}
                        sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        View All Trending
                    </Button>
                </Box>

                {loading.trending ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <LoadingSpinner message="Loading trending memes..." />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {trendingMemes.slice(0, 6).map((meme, index) => (
                            <Grid item xs={12} sm={6} md={4} key={meme.id}>
                                <Zoom in={true} timeout={1000 + index * 100}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            cursor: 'pointer',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            background: theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.divider}`,
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            position: 'relative',
                                            '&:hover': {
                                                transform: 'translateY(-12px) scale(1.02)',
                                                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
                                                '& .meme-image': {
                                                    transform: 'scale(1.1)',
                                                },
                                                '& .meme-overlay': {
                                                    opacity: 1,
                                                },
                                            },
                                        }}
                                        onClick={() => navigate(`/meme/${meme.id}`)}
                                    >
                                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                            <CardMedia
                                                component="img"
                                                height="240"
                                                image={meme.imageUrl}
                                                alt={meme.title}
                                                className="meme-image"
                                                sx={{ 
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.4s ease',
                                                }}
                                            />
                                            <Box
                                                className="meme-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    p: 2,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        sx={{ 
                                                            background: 'rgba(255, 255, 255, 0.2)',
                                                            color: 'white',
                                                            backdropFilter: 'blur(10px)',
                                                            '&:hover': { background: 'rgba(255, 255, 255, 0.3)' }
                                                        }}
                                                    >
                                                        <FavoriteIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        sx={{ 
                                                            background: 'rgba(255, 255, 255, 0.2)',
                                                            color: 'white',
                                                            backdropFilter: 'blur(10px)',
                                                            '&:hover': { background: 'rgba(255, 255, 255, 0.3)' }
                                                        }}
                                                    >
                                                        <ShareIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            
                                            {/* Trending Badge */}
                                            <Chip
                                                label="🔥 Trending"
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                }}
                                            />
                                        </Box>
                                        
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography 
                                                variant="h6" 
                                                component="h3" 
                                                sx={{
                                                    fontWeight: 600,
                                                    mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {meme.title}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Chip 
                                                    label={meme.category} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        borderColor: theme.palette.primary.main,
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 500,
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                                        <Typography variant="caption" fontWeight={600}>
                                                            {meme.stats.likesCount}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <ViewIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {meme.stats.viewsCount || '1.2k'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {meme.description || 'A hilarious meme that\'s taking the internet by storm!'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Home;
