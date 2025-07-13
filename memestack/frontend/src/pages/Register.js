// 📝 Register Page Component
// User registration form

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
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

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

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        // Username validation
        if (!formData.username) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
        }

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

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
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

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);
        
        if (result.success) {
            navigate('/dashboard', { replace: true });
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
                    🎭 Join MemeStack
                </Typography>
                
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                >
                    Create your account and start sharing your creativity with the world.
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

                {/* Register Form */}
                <Box 
                    component="form" 
                    onSubmit={handleSubmit}
                    sx={{ width: '100%' }}
                >
                    {/* Username Field */}
                    <TextField
                        fullWidth
                        id="username"
                        name="username"
                        label="Username"
                        value={formData.username}
                        onChange={handleChange}
                        error={!!validationErrors.username}
                        helperText={validationErrors.username}
                        margin="normal"
                        autoComplete="username"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

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
                        autoComplete="new-password"
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

                    {/* Confirm Password Field */}
                    <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        margin="normal"
                        autoComplete="new-password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={handleToggleConfirmPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                            'Create Account'
                        )}
                    </Button>

                    {/* Links */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                sx={{ 
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign in here
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Terms */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" sx={{ textDecoration: 'none' }}>
                        Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" sx={{ textDecoration: 'none' }}>
                        Privacy Policy
                    </Link>
                    .
                </Typography>
            </Box>
        </Container>
    );
};

export default Register;
