// Simple Frontend API Test
// Add this as a temporary component to test API connectivity

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';

const APIConnectionTest = () => {
    const [status, setStatus] = useState('idle');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const testEndpoints = async () => {
        setLoading(true);
        setStatus('testing');
        const testResults = [];

        const endpoints = [
            { name: 'Health Check', url: `${API_BASE}/health` },
            { name: 'Templates', url: `${API_BASE}/templates` },
            { name: 'Memes', url: `${API_BASE}/memes` },
            { name: 'Comments Docs', url: `${API_BASE}/comments/docs` }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url);
                testResults.push({
                    name: endpoint.name,
                    status: response.ok ? 'success' : 'error',
                    message: response.ok ? `OK (${response.status})` : `Error ${response.status}`
                });
            } catch (error) {
                testResults.push({
                    name: endpoint.name,
                    status: 'error',
                    message: error.message.includes('fetch') ? 'Backend not running' : error.message
                });
            }
        }

        setResults(testResults);
        setLoading(false);
        setStatus('complete');
    };

    const allPassed = results.every(r => r.status === 'success');
    const anyFailed = results.some(r => r.status === 'error');

    return (
        <Box sx={{ p: 3, border: 1, borderColor: 'grey.300', borderRadius: 2, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                🔧 API Connection Test
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Test the connection between frontend and backend servers
            </Typography>

            <Button 
                variant="contained" 
                onClick={testEndpoints}
                disabled={loading}
                sx={{ mb: 2 }}
            >
                {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                Test API Connection
            </Button>

            {status === 'complete' && (
                <Alert 
                    severity={allPassed ? 'success' : 'error'} 
                    sx={{ mb: 2 }}
                >
                    {allPassed ? 
                        '✅ All API endpoints are working!' : 
                        '❌ Some endpoints failed. Check backend server.'}
                </Alert>
            )}

            {results.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Test Results:
                    </Typography>
                    {results.map((result, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: result.status === 'success' ? 'success.main' : 'error.main',
                                    fontFamily: 'monospace',
                                    minWidth: 20
                                }}
                            >
                                {result.status === 'success' ? '✅' : '❌'}
                            </Typography>
                            <Typography variant="body2" sx={{ mx: 1, minWidth: 120 }}>
                                {result.name}:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {result.message}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {anyFailed && status === 'complete' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                        🔧 Troubleshooting:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        • Make sure backend server is running: <code>npm run dev</code> in backend folder
                    </Typography>
                    <Typography variant="body2">
                        • Check backend URL: {API_BASE}
                    </Typography>
                    <Typography variant="body2">
                        • Use start-servers.bat to start both servers
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default APIConnectionTest;
