// 🏠 Home Page Component
// Landing page showcasing MemeStack features

import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
    PhotoLibrary as GalleryIcon,
    Add as CreateIcon,
    TrendingUp as TrendingIcon,
    People as CommunityIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMemes } from '../contexts/MemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { healthAPI } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isAuthenticated } = useAuth();
    const { 
        trendingMemes, 
        loading, 
        fetchTrendingMemes 
    } = useMemes();

    // Fetch trending memes on component mount (force initial load)
    useEffect(() => {
        fetchTrendingMemes(6);
    }, []); // Empty dependency array for initial mount

    // Fetch trending memes on component mount
    useEffect(() => {
        fetchTrendingMemes(6);
    }, [fetchTrendingMemes]);

    // Features data
    const features = [
        {
            icon: <CreateIcon sx={{ fontSize: 40 }} />,
            title: 'Create Memes',
            description: 'Design amazing memes with our easy-to-use creation tools and templates.',
            color: theme.palette.primary.main,
        },
        {
            icon: <GalleryIcon sx={{ fontSize: 40 }} />,
            title: 'Browse Gallery',
            description: 'Discover thousands of hilarious memes created by our community.',
            color: theme.palette.secondary.main,
        },
        {
            icon: <TrendingIcon sx={{ fontSize: 40 }} />,
            title: 'Trending Content',
            description: 'Stay up-to-date with the hottest memes and viral content.',
            color: theme.palette.success.main,
        },
        {
            icon: <CommunityIcon sx={{ fontSize: 40 }} />,
            title: 'Community',
            description: 'Join a vibrant community of meme creators and enthusiasts.',
            color: theme.palette.warning.main,
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: 'Secure Platform',
            description: 'Your content is safe with our secure authentication and privacy controls.',
            color: theme.palette.error.main,
        },
        {
            icon: <SpeedIcon sx={{ fontSize: 40 }} />,
            title: 'Fast & Responsive',
            description: 'Lightning-fast performance on all devices for the best user experience.',
            color: theme.palette.info.main,
        },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h1"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            fontWeight: 700,
                            mb: 3,
                        }}
                    >
                        🎭 Welcome to MemeStack
                    </Typography>
                    
                    <Typography
                        variant="h5"
                        component="p"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.2rem', md: '1.5rem' },
                            opacity: 0.9,
                            mb: 4,
                            maxWidth: '800px',
                            mx: 'auto',
                        }}
                    >
                        The ultimate platform for meme creators and enthusiasts. 
                        Create, share, and discover the funniest memes on the internet.
                    </Typography>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            justifyContent: 'center',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                        }}
                    >
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<CreateIcon />}
                                    onClick={() => navigate('/create')}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                        },
                                    }}
                                >
                                    Create Meme
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<GalleryIcon />}
                                    onClick={() => navigate('/dashboard')}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    Dashboard
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                        },
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<GalleryIcon />}
                                    onClick={() => navigate('/gallery')}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    Browse Memes
                                </Button>
                            </>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography
                    variant="h2"
                    component="h2"
                    textAlign="center"
                    gutterBottom
                    sx={{ mb: 6 }}
                >
                    Why Choose MemeStack?
                </Typography>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'center',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box
                                        sx={{
                                            color: feature.color,
                                            mb: 2,
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Trending Memes Section */}
            <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
                <Container maxWidth="lg">
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 4,
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                        }}
                    >
                        <Typography variant="h2" component="h2">
                            🔥 Trending Memes
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/gallery')}
                            sx={{ fontWeight: 500 }}
                        >
                            View All
                        </Button>
                    </Box>

                    {loading.trending ? (
                        <LoadingSpinner message="Loading trending memes..." />
                    ) : (
                        <Grid container spacing={3}>
                            {trendingMemes.slice(0, 6).map((meme) => (
                                <Grid item xs={12} sm={6} md={4} key={meme.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                        onClick={() => navigate(`/meme/${meme.id}`)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={meme.imageUrl}
                                            alt={meme.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                component="h3" 
                                                gutterBottom
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {meme.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Chip 
                                                    label={meme.category} 
                                                    size="small" 
                                                    color="primary" 
                                                />
                                                <Chip 
                                                    label={`❤️ ${meme.stats.likesCount}`} 
                                                    size="small" 
                                                    variant="outlined" 
                                                />
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
                                                }}
                                            >
                                                {meme.description || 'No description available'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* Call to Action Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h3" component="h2" gutterBottom>
                        Ready to Start Creating?
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                        Join thousands of creators and share your humor with the world.
                    </Typography>
                    {!isAuthenticated && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                backgroundColor: 'white',
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                },
                            }}
                        >
                            Sign Up Now
                        </Button>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
