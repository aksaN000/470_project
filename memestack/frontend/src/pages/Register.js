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
    Fade,
    Zoom,
    useTheme,
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
import { useThemeMode } from '../contexts/ThemeContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();

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
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(99, 102, 241, 0.1)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
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
                                    
                                    {/* Join MemeStack Text with Gradient */}
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
                                        Join MemeStack
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
                                    Create your account and start sharing your creativity with the world.
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

                        {/* Enhanced Register Form */}
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
                                            <PersonIcon sx={{ color: theme.palette.primary.main }} />
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
                                autoComplete="new-password"
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
                                                aria-label="toggle confirm password visibility"
                                                onClick={handleToggleConfirmPassword}
                                                edge="end"
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                    },
                                                }}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                    'Create Account'
                                )}
                            </Button>

                            {/* Enhanced Links */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        background: mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.6)',
                                        backdropFilter: 'blur(10px)',
                                        border: mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        Already have an account?{' '}
                                        <Link
                                            component={RouterLink}
                                            to="/login"
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
                                            Sign in here
                                        </Link>
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                {/* Enhanced Terms */}
                <Fade in={true} timeout={1500}>
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                background: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(20px)',
                                border: mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                borderRadius: '16px',
                            }}
                        >
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                }}
                            >
                                By creating an account, you agree to our{' '}
                                <Link 
                                    href="/terms" 
                                    sx={{ 
                                        color: theme.palette.primary.main,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link 
                                    href="/privacy" 
                                    sx={{ 
                                        color: theme.palette.primary.main,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </Typography>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Register;
