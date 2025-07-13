// 📊 Dashboard Page Component
// User dashboard with personal meme collection and stats

import React from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Button,
} from '@mui/material';
import {
    Add as AddIcon,
    PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome back, {user?.username}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Ready to create some amazing memes?
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Create New Meme
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Start creating your next viral meme
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/create')}
                                startIcon={<AddIcon />}
                            >
                                Create Meme
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <GalleryIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Browse Gallery
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Discover trending memes from the community
                            </Typography>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/gallery')}
                                startIcon={<GalleryIcon />}
                            >
                                View Gallery
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                                {user?.stats?.memesCreated || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Memes Created
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="secondary.main">
                                {user?.stats?.totalLikes || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Likes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {user?.stats?.totalViews || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Views
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                                {user?.stats?.totalShares || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Shares
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
