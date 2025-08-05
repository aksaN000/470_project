// 👤 Profile Page Component
// User profile management

import React from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Avatar,
    Chip,
    Grid,
    Button,
    Divider,
    Paper,
    useTheme,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const Profile = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode } = useThemeMode();
    const { user } = useAuth();

    const handleEditProfile = () => {
        navigate('/profile/edit');
    };

    const formatJoinDate = (date) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: mode === 'light' 
                ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Fade in={true} timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(99, 102, 241, 0.1)',
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
                                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                            },
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            {/* Enhanced Header with Edit Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography 
                                    variant="h3" 
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                    }}
                                >
                                    👤 My Profile
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={handleEditProfile}
                                        sx={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            borderRadius: '12px',
                                            px: 3,
                                            py: 1.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5b5bf6, #7c3aed)',
                                                boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                                            },
                                        }}
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<SettingsIcon />}
                                        onClick={() => navigate('/settings')}
                                        sx={{
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            borderRadius: '12px',
                                            px: 3,
                                            py: 1.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderColor: theme.palette.primary.dark,
                                            },
                                        }}
                                    >
                                        Settings
                                    </Button>
                                </Box>
                            </Box>

                            {/* Enhanced Profile Header */}
                            <Zoom in={true} timeout={1200}>
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <Avatar
                                        sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            mx: 'auto', 
                                            mb: 3,
                                            fontSize: '3rem',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            border: '4px solid rgba(99, 102, 241, 0.2)',
                                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                        }}
                                        src={user?.profile?.avatar}
                                    >
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    
                                    <Typography 
                                        variant="h4" 
                                        gutterBottom
                                        sx={{ 
                                            fontWeight: 700,
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        {user?.profile?.displayName || user?.username}
                                    </Typography>
                                    
                                    {user?.profile?.displayName && (
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            @{user?.username}
                                        </Typography>
                                    )}
                                    
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            mb: 2,
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        {user?.email}
                                    </Typography>

                                    {user?.profile?.bio && (
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                mb: 3, 
                                                maxWidth: 500, 
                                                mx: 'auto',
                                                color: theme.palette.text.primary,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {user.profile.bio}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <Chip 
                                            icon={<CalendarIcon />}
                                            label={`Joined ${formatJoinDate(user?.profile?.joinDate || user?.createdAt)}`} 
                                            sx={{
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                color: 'white',
                                                fontWeight: 600,
                                                '& .MuiChip-label': {
                                                    color: 'white'
                                                },
                                                '& .MuiChip-icon': {
                                                    color: 'white'
                                                }
                                            }}
                                        />
                                        {user?.preferences?.theme && (
                                            <Chip 
                                                label={`${user.preferences.theme === 'dark' ? '🌙' : '🌞'} ${user.preferences.theme} theme`} 
                                                variant="outlined"
                                                sx={{
                                                    borderColor: theme.palette.primary.main,
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Zoom>

                            <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                            {/* Enhanced Stats Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        mb: 3,
                                    }}
                                >
                                    📊 Your Stats
                                </Typography>
                                
                                <Grid container spacing={3} justifyContent="center">
                                    {[
                                        { label: 'Memes Created', value: user?.stats?.memesCreated || 0, icon: '🎨' },
                                        { label: 'Total Likes', value: user?.stats?.totalLikes || 0, icon: '❤️' },
                                        { label: 'Total Views', value: user?.stats?.totalViews || 0, icon: '👀' },
                                        { label: 'Total Shares', value: user?.stats?.totalShares || 0, icon: '📤' },
                                    ].map((stat, index) => (
                                        <Grid item xs={6} sm={3} key={stat.label}>
                                            <Zoom in={true} timeout={1400 + index * 200}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        textAlign: 'center',
                                                        background: mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.05)'
                                                            : 'rgba(255, 255, 255, 0.8)',
                                                        backdropFilter: 'blur(20px)',
                                                        border: mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                                        borderRadius: '16px',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: mode === 'dark'
                                                                ? '0 12px 40px rgba(99, 102, 241, 0.3)'
                                                                : '0 12px 40px rgba(99, 102, 241, 0.2)',
                                                        },
                                                    }}
                                                >
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ mb: 1, fontSize: '2rem' }}
                                                    >
                                                        {stat.icon}
                                                    </Typography>
                                                    <Typography 
                                                        variant="h4" 
                                                        sx={{ 
                                                            fontWeight: 800,
                                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                            backgroundClip: 'text',
                                                            WebkitBackgroundClip: 'text',
                                                            color: 'transparent',
                                                            mb: 1,
                                                        }}
                                                    >
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: theme.palette.text.secondary,
                                                            fontWeight: 500,
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

                            {/* Enhanced Account Info */}
                            <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                            
                            <Box>
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        mb: 3,
                                    }}
                                >
                                    ⚙️ Account Settings
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(20px)',
                                                border: mode === 'dark'
                                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                                borderRadius: '16px',
                                            }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 600,
                                                    mb: 1,
                                                }}
                                            >
                                                Theme Preference
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ 
                                                    color: theme.palette.text.primary,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user?.preferences?.theme === 'dark' ? '🌙 Dark' : '🌞 Light'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(20px)',
                                                border: mode === 'dark'
                                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                                borderRadius: '16px',
                                            }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 600,
                                                    mb: 1,
                                                }}
                                            >
                                                Notifications
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ 
                                                    color: theme.palette.text.primary,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user?.preferences?.notifications ? '🔔 Enabled' : '🔕 Disabled'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
};

export default Profile;
