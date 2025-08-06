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
    useTheme,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
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

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
        }}>
            <Container maxWidth="sm">
                <Fade in={true} timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            background: mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                            backdropFilter: 'blur(50px)',
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.15)'
                                : '2px solid rgba(99, 102, 241, 0.15)',
                            borderTop: mode === 'dark'
                                ? '3px solid rgba(255, 255, 255, 0.25)'
                                : '3px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: mode === 'dark'
                                ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 50%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                            },
                        }}
                    >
                        {/* Enhanced Header */}
                        <Zoom in={true} timeout={1200}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography 
                                    variant="h3" 
                                    component="h1" 
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1.5,
                                    }}
                                >
                                    {/* Theater Masks Emoji - Separate for Natural Colors */}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontSize: 'inherit',
                                            filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                            '&:hover': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                transition: 'transform 0.3s ease',
                                            },
                                        }}
                                    >
                                        🎭
                                    </Box>
                                    
                                    {/* Welcome Back Text with Gradient */}
                                    <Box
                                        component="span"
                                        sx={{
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.accent || '#ec4899'} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                            // Fallback for browsers that don't support background-clip
                                            '@supports not (-webkit-background-clip: text)': {
                                                background: 'none',
                                                color: currentThemeColors?.primary || '#6366f1',
                                            },
                                        }}
                                    >
                                        Welcome Back
                                    </Box>
                                </Typography>
                                
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Sign in to your MemeStack account to continue creating and sharing memes.
                                </Typography>
                            </Box>
                        </Zoom>

                        {/* Error Alert */}
                        {error && (
                            <Fade in={true} timeout={800}>
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        width: '100%', 
                                        mb: 3,
                                        borderRadius: '12px',
                                        background: mode === 'dark'
                                            ? 'rgba(244, 67, 54, 0.1)'
                                            : 'rgba(244, 67, 54, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(244, 67, 54, 0.2)',
                                    }}
                                    onClose={clearError}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {/* Enhanced Login Form */}
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)',
                                        },
                                        '&.Mui-focused': {
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: theme.palette.primary.main }} />
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)',
                                        },
                                        '&.Mui-focused': {
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 1)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: theme.palette.primary.main }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                edge="end"
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                    },
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Enhanced Submit Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{ 
                                    mt: 4, 
                                    mb: 3,
                                    py: 2,
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                    textTransform: 'none',
                                    boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                        boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        background: `${currentThemeColors?.primary || '#6366f1'}80`,
                                        color: 'white',
                                    },
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            {/* Enhanced Links */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Link
                                    component={RouterLink}
                                    to="/forgot-password"
                                    variant="body2"
                                    sx={{ 
                                        display: 'block', 
                                        mb: 3,
                                        color: theme.palette.primary.main,
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        '&:hover': { 
                                            textDecoration: 'underline',
                                            color: theme.palette.primary.dark,
                                        }
                                    }}
                                >
                                    Forgot your password?
                                </Link>
                                
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        background: mode === 'dark'
                                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                                        backdropFilter: 'blur(40px)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.12)'
                                            : '2px solid rgba(99, 102, 241, 0.12)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.2)'
                                            : '3px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '12px',
                                        boxShadow: mode === 'dark'
                                            ? '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                            : '0 8px 30px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        Don't have an account?{' '}
                                        <Link
                                            component={RouterLink}
                                            to="/register"
                                            sx={{ 
                                                fontWeight: 600,
                                                color: theme.palette.primary.main,
                                                textDecoration: 'none',
                                                '&:hover': { 
                                                    textDecoration: 'underline',
                                                    color: theme.palette.primary.dark,
                                                }
                                            }}
                                        >
                                            Sign up here
                                        </Link>
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                {/* Enhanced Additional Info */}
                <Fade in={true} timeout={1500}>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                background: mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                                backdropFilter: 'blur(40px)',
                                border: mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.12)'
                                    : '2px solid rgba(99, 102, 241, 0.12)',
                                borderTop: mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.2)'
                                    : '3px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                boxShadow: mode === 'dark'
                                    ? '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 8px 30px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                            }}
                        >
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                }}
                            >
                                🔒 Your data is secure and protected with industry-standard encryption.
                            </Typography>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Login;
