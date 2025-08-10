import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SystemStatus = () => {
    const { user, isLoading } = useAuth();
    const [backendStatus, setBackendStatus] = useState('checking...');
    const [tokenInfo, setTokenInfo] = useState(null);

    useEffect(() => {
        checkBackendStatus();
        checkTokenInfo();
    }, []);

    const checkBackendStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            if (response.ok) {
                setBackendStatus('✅ Backend is running');
            } else {
                setBackendStatus('❌ Backend error: ' + response.status);
            }
        } catch (error) {
            setBackendStatus('❌ Backend not reachable: ' + error.message);
        }
    };

    const checkTokenInfo = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setTokenInfo({
                    exists: true,
                    payload,
                    expired: payload.exp < Date.now() / 1000
                });
            } catch (error) {
                setTokenInfo({
                    exists: true,
                    error: 'Invalid token format'
                });
            }
        } else {
            setTokenInfo({
                exists: false
            });
        }
    };

    const testFolderCreation = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: 'Test Folder ' + Date.now(),
                    description: 'Testing folder creation',
                    color: '#6366f1',
                    icon: 'folder',
                    isPrivate: true
                })
            });

            const data = await response.json();
            alert(`Folder creation test: ${response.status}\n${JSON.stringify(data, null, 2)}`);
        } catch (error) {
            alert(`Folder creation error: ${error.message}`);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                System Status & Debug
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Backend Status</Typography>
                    <Typography>{backendStatus}</Typography>
                    <Button onClick={checkBackendStatus} variant="outlined" size="small" sx={{ mt: 1 }}>
                        Recheck Backend
                    </Button>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Authentication Status</Typography>
                    <Typography>Loading: {isLoading ? 'Yes' : 'No'}</Typography>
                    <Typography>User: {user ? `${user.username} (${user.email})` : 'Not logged in'}</Typography>
                    <Typography>Token exists: {tokenInfo?.exists ? 'Yes' : 'No'}</Typography>
                    {tokenInfo?.expired && <Alert severity="error">Token is expired</Alert>}
                    {tokenInfo?.error && <Alert severity="error">Token error: {tokenInfo.error}</Alert>}
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Test Actions</Typography>
                    <Button onClick={testFolderCreation} variant="contained" sx={{ mt: 1 }}>
                        Test Folder Creation
                    </Button>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Console Instructions</Typography>
                    <Typography variant="body2">
                        Open browser dev tools (F12) and check the Console tab for detailed error messages.
                        Look for network errors, authentication issues, or form-related warnings.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default SystemStatus;
