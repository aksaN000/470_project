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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
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
                        {user?.username}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {user?.email}
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Chip 
                            label={`Member since ${new Date(user?.createdAt).getFullYear()}`} 
                            color="primary" 
                        />
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Your Stats
                    </Typography>
                    
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <Typography variant="h4" color="primary.main">
                                {user?.stats?.memesCreated || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Memes Created
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" color="secondary.main">
                                {user?.stats?.totalLikes || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Likes
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h4" color="success.main">
                                {user?.stats?.totalViews || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Views
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Profile;
