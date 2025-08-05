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
    Memory as MemoryIcon,
    Favorite as FavoriteIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';

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
                    <ActionCard
                        title="Create New Meme"
                        description="Start creating your next viral meme"
                        icon={<AddIcon />}
                        buttonText="Create Meme"
                        buttonStartIcon={<AddIcon />}
                        onClick={() => navigate('/create')}
                        color="primary"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <ActionCard
                        title="Browse Gallery"
                        description="Discover trending memes from the community"
                        icon={<GalleryIcon />}
                        buttonText="View Gallery"
                        buttonStartIcon={<GalleryIcon />}
                        buttonVariant="outlined"
                        buttonColor="secondary"
                        onClick={() => navigate('/gallery')}
                        color="secondary"
                    />
                </Grid>

                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Memes Created"
                        value={user?.stats?.memesCreated || 0}
                        color="primary"
                        variant="compact"
                        icon={<MemoryIcon />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Likes"
                        value={user?.stats?.totalLikes || 0}
                        color="secondary"
                        variant="compact"
                        icon={<FavoriteIcon />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Views"
                        value={user?.stats?.totalViews || 0}
                        color="success"
                        variant="compact"
                        icon={<VisibilityIcon />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Shares"
                        value={user?.stats?.totalShares || 0}
                        color="warning"
                        variant="compact"
                        icon={<ShareIcon />}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
