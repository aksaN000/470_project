// 404 Not Found Page Component
// Error page for invalid routes

import React from 'react';
import {
    Container,
    Typography,
    Button,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '6rem', mb: 2 }}>
                🤔
            </Typography>
            <Typography variant="h2" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Oops! The page you're looking for seems to have disappeared into the meme void.
            </Typography>
            <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
            >
                Go Home
            </Button>
        </Container>
    );
};

export default NotFound;
