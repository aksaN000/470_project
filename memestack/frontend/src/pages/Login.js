// 🔐 Login Page Component
// User authentication login form

import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Get the redirect path from location state
    const from = location.state?.from?.pathname || '/dashboard';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    // Clear errors when component mounts (force initial clear)
    useEffect(() => {
        clearError();
    }, []); // Empty dependency array for initial mount

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Toggle password visibility
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const result = await login(formData);
        
        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    // Handle demo login
    const handleDemoLogin = async () => {
        const demoCredentials = {
            email: 'demo@memestack.com',
            password: 'demo123'
        };

        setFormData(demoCredentials);
        const result = await login(demoCredentials);
        
        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Header */}
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 1 }}
                >
                    🎭 Welcome Back
                </Typography>
                
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                >
                    Sign in to your MemeStack account to continue creating and sharing memes.
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ width: '100%', mb: 3 }}
                        onClose={clearError}
                    >
                        {error}
                    </Alert>
                )}

                {/* Login Form */}
                <Box 
                    component="form" 
                    onSubmit={handleSubmit}
                    sx={{ width: '100%' }}
                >
                    {/* Email Field */}
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        margin="normal"
                        autoComplete="email"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Password Field */}
                    <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
                        margin="normal"
                        autoComplete="current-password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                            mt: 3, 
                            mb: 2,
                            py: 1.5,
                            fontWeight: 600,
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    {/* Demo Account Info */}
                    <Box 
                        sx={{ 
                            mb: 2, 
                            p: 2, 
                            bgcolor: 'primary.50',
                            border: '1px solid',
                            borderColor: 'primary.200',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                            🎭 Try Demo Account
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Email: demo@memestack.com
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Password: demo123
                        </Typography>
                    </Box>

                    {/* Demo Login Button */}
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        sx={{ 
                            mb: 3,
                            py: 1.5,
                            fontWeight: 500,
                        }}
                    >
                        Try Demo Account
                    </Button>

                    {/* Links */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            component={RouterLink}
                            to="/forgot-password"
                            variant="body2"
                            sx={{ 
                                display: 'block', 
                                mb: 2,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Forgot your password?
                        </Link>
                        
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/register"
                                sx={{ 
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign up here
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Additional Info */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    🔒 Your data is secure and protected with industry-standard encryption.
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;
