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
} from '@mui/material';
import {
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    {/* Header with Edit Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1">
                            👤 My Profile
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditProfile}
                        >
                            Edit Profile
                        </Button>
                    </Box>

                    {/* Profile Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar
                            sx={{ 
                                width: 120, 
                                height: 120, 
                                mx: 'auto', 
                                mb: 2,
                                fontSize: '3rem',
                            }}
                            src={user?.profile?.avatar}
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        
                        <Typography variant="h4" gutterBottom>
                            {user?.profile?.displayName || user?.username}
                        </Typography>
                        
                        {user?.profile?.displayName && (
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                @{user?.username}
                            </Typography>
                        )}
                        
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {user?.email}
                        </Typography>

                        {user?.profile?.bio && (
                            <Typography variant="body1" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                                {user.profile.bio}
                            </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                                icon={<CalendarIcon />}
                                label={`Joined ${formatJoinDate(user?.profile?.joinDate || user?.createdAt)}`} 
                                color="primary" 
                            />
                            {user?.preferences?.theme && (
                                <Chip 
                                    label={`${user.preferences.theme === 'dark' ? '🌙' : '🌞'} ${user.preferences.theme} theme`} 
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Stats Section */}
                    <Typography variant="h6" gutterBottom textAlign="center">
                        📊 Your Stats
                    </Typography>
                    
                    <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary.main">
                                    {user?.stats?.memesCreated || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Memes Created
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="secondary.main">
                                    {user?.stats?.totalLikes || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Likes
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="success.main">
                                    {user?.stats?.totalViews || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Views
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="warning.main">
                                    {user?.stats?.totalShares || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Shares
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Account Info */}
                    <Divider sx={{ my: 4 }} />
                    
                    <Typography variant="h6" gutterBottom textAlign="center">
                        ⚙️ Account Settings
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Theme Preference
                                </Typography>
                                <Typography variant="body1">
                                    {user?.preferences?.theme === 'dark' ? '🌙 Dark' : '🌞 Light'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Notifications
                                </Typography>
                                <Typography variant="body1">
                                    {user?.preferences?.notifications ? '🔔 Enabled' : '🔕 Disabled'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Profile;
