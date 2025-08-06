// 📊 Enhanced Dashboard Page Component
// Modern user dashboard with comprehensive stats and quick actions

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Button,
    useTheme,
    Paper,
    Avatar,
    Chip,
    LinearProgress,
    Stack,
    IconButton,
    Fade,
    Slide,
    Zoom,
} from '@mui/material';
import {
    Add as AddIcon,
    PhotoLibrary as GalleryIcon,
    Memory as MemoryIcon,
    Favorite as FavoriteIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
    TrendingUp as TrendingIcon,
    EmojiEvents as AchievementIcon,
    Timeline as AnalyticsIcon,
    Notifications as NotificationIcon,
    Settings as SettingsIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    const { user } = useAuth();
    const [animationStep, setAnimationStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationStep(prev => (prev + 1) % 3);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    // Enhanced stats data
    const userStats = [
        {
            icon: <MemoryIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
            title: 'Total Memes',
            value: user?.stats?.totalMemes || '12',
            change: '+3 this week',
        },
        {
            icon: <FavoriteIcon sx={{ fontSize: 40, color: '#ef4444' }} />,
            title: 'Total Likes',
            value: user?.stats?.totalLikes || '1.2k',
            change: '+127 this week',
        },
        {
            icon: <VisibilityIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
            title: 'Total Views',
            value: user?.stats?.totalViews || '15.7k',
            change: '+2.1k this week',
        },
        {
            icon: <ShareIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
            title: 'Shares',
            value: user?.stats?.totalShares || '89',
            change: '+12 this week',
        },
    ];

    // Quick actions with enhanced styling
    const quickActions = [
        {
            title: 'Create New Meme',
            description: 'Use our AI-powered editor to create viral content',
            icon: <AddIcon sx={{ fontSize: 60, color: '#10b981' }} />,
            action: () => navigate('/create'),
            badge: 'Popular'
        },
        {
            title: 'Browse Templates',
            description: 'Explore thousands of trending meme templates',
            icon: <GalleryIcon sx={{ fontSize: 60, color: '#f59e0b' }} />,
            action: () => navigate('/templates'),
            badge: 'New'
        },
        {
            title: 'View Analytics',
            description: 'Track your meme performance and engagement',
            icon: <AnalyticsIcon sx={{ fontSize: 60, color: '#8b5cf6' }} />,
            action: () => navigate('/analytics'),
            badge: 'Pro'
        },
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
        }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Enhanced Header Section */}
                <Fade in={true} timeout={1000}>
                    <Box sx={{ mb: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                background: mode === 'light'
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${mode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '24px',
                                position: 'relative',
                                overflow: 'hidden',
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
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                                <Avatar
                                    src={user?.profilePicture}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                        border: '4px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                
                                <Box sx={{ flex: 1, textAlign: 'center' }}>
                                    <Typography 
                                        variant="h3" 
                                        component="h1" 
                                        sx={{ 
                                            fontWeight: 800,
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {/* Welcome Text with Gradient */}
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
                                            Welcome back, {user?.username}!
                                        </Box>
                                        
                                        {/* Waving Hand Emoji - Separate for Natural Colors */}
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: 'inherit',
                                                filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                                '&:hover': {
                                                    transform: 'scale(1.1) rotate(15deg)',
                                                    transition: 'transform 0.3s ease',
                                                },
                                            }}
                                        >
                                            👋
                                        </Box>
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        Ready to create your next viral masterpiece?
                                    </Typography>
                                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                        <Chip
                                            icon={<TrendingIcon sx={{ color: 'white' }} />}
                                            label="Trending Creator"
                                            size="small"
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.warning || '#f59e0b'} 0%, ${currentThemeColors?.error || '#ef4444'} 100%)`,
                                                color: 'white',
                                                fontWeight: 600,
                                                '& .MuiChip-icon': { color: 'white' },
                                            }}
                                        />
                                        <Chip
                                            icon={<AchievementIcon sx={{ color: 'primary.main' }} />}
                                            label={`Level ${user?.level || 5}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: theme.palette.primary.main, 
                                                color: theme.palette.primary.main,
                                                '& .MuiChip-icon': { color: theme.palette.primary.main },
                                            }}
                                        />
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        onClick={() => navigate('/settings')}
                                        sx={{
                                            '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
                                        }}
                                    >
                                        <SettingsIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                                    </IconButton>
                                    <IconButton
                                        sx={{
                                            '&:hover': { background: 'rgba(236, 72, 153, 0.1)' }
                                        }}
                                    >
                                        <NotificationIcon sx={{ color: '#ec4899', fontSize: 28 }} />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>

                {/* Enhanced Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {userStats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Zoom in={true} timeout={1000 + index * 200}>
                                <Card
                                    sx={{
                                        height: '200px',
                                        background: mode === 'dark' 
                                            ? 'rgba(255, 255, 255, 0.05)' 
                                            : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(20px)',
                                        border: mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)',
                                            boxShadow: mode === 'dark'
                                                ? '0 20px 60px rgba(99, 102, 241, 0.3)'
                                                : '0 20px 60px rgba(99, 102, 241, 0.2)',
                                            borderColor: mode === 'dark'
                                                ? 'rgba(99, 102, 241, 0.4)'
                                                : 'rgba(99, 102, 241, 0.3)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ mr: 2 }}>
                                                {stat.icon}
                                            </Box>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                        
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                fontWeight: 800, 
                                                mb: 1,
                                                color: theme.palette.text.primary
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                opacity: 0.7,
                                                color: theme.palette.text.secondary,
                                                mt: 'auto'
                                            }}
                                        >
                                            {stat.change}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Actions Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography 
                        variant="h4" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 4,
                            textAlign: 'center',
                            color: theme.palette.text.primary,
                        }}
                    >
                        Quick Actions
                    </Typography>
                    
                    <Grid container spacing={4}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Slide direction="up" in={true} timeout={1000 + index * 200}>
                                    <Card
                                        onClick={action.action}
                                        sx={{
                                            height: '320px',
                                            background: mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(20px)',
                                            border: mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : '1px solid rgba(99, 102, 241, 0.1)',
                                            borderRadius: '24px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            '&:hover': {
                                                transform: 'translateY(-12px)',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                    : 'rgba(255, 255, 255, 1)',
                                                boxShadow: mode === 'dark'
                                                    ? '0 25px 80px rgba(99, 102, 241, 0.3)'
                                                    : '0 25px 80px rgba(99, 102, 241, 0.2)',
                                                borderColor: mode === 'dark'
                                                    ? 'rgba(99, 102, 241, 0.4)'
                                                    : 'rgba(99, 102, 241, 0.3)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                <Chip
                                                    label={action.badge}
                                                    size="small"
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
                                            </Box>
                                            
                                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                                {action.icon}
                                            </Box>
                                            
                                            <Typography 
                                                variant="h5" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    mb: 2,
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                {action.title}
                                            </Typography>
                                            
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    opacity: 0.8, 
                                                    flex: 1,
                                                    color: theme.palette.text.secondary
                                                }}
                                            >
                                                {action.description}
                                            </Typography>
                                            
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    mt: 2,
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b5bf6'}, ${currentThemeColors?.secondaryHover || '#7c3aed'})`,
                                                        boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                    },
                                                }}
                                            >
                                                Get Started
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Slide>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Dashboard;
