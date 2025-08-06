// ✏️ Edit Profile Page Component
// Comprehensive profile editing with avatar upload

import React, { useState, useRef } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    IconButton,
    Divider,
    Paper,
    Fade,
    Zoom,
    useTheme,
} from '@mui/material';
import {
    PhotoCamera as PhotoCameraIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { uploadAPI } from '../services/api';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();

    const [formData, setFormData] = useState({
        username: user?.username || '',
        displayName: user?.profile?.displayName || '',
        bio: user?.profile?.bio || '',
        avatar: user?.profile?.avatar || '',
        theme: user?.preferences?.theme || 'light',
        notifications: user?.preferences?.notifications || true,
    });

    const [loading, setLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState(formData.avatar);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
        setSuccess('');
    };

    const handleAvatarSelect = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setAvatarUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            console.log('📤 Uploading avatar...');
            const response = await uploadAPI.uploadAvatar(file, (progress) => {
                setUploadProgress(progress);
            });

            if (response.success) {
                const newAvatarUrl = response.data.url;
                setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
                setPreviewAvatar(newAvatarUrl);
                setSuccess('Avatar uploaded successfully!');
                console.log('✅ Avatar uploaded:', newAvatarUrl);
            } else {
                throw new Error(response.message || 'Failed to upload avatar');
            }
        } catch (error) {
            console.error('❌ Avatar upload error:', error);
            setError(error.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('💾 Updating profile...');
            const result = await updateProfile(formData);
            
            if (result.success) {
                setSuccess('Profile updated successfully!');
                console.log('✅ Profile updated successfully');
                // Navigate back to profile after a short delay
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="md">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Enhanced Header */}
                        <Zoom in={true} timeout={1200}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
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
                                <Box sx={{ textAlign: 'center' }}>
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
                                        {/* Pencil Emoji - Separate for Natural Colors */}
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: 'inherit',
                                                filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                                '&:hover': {
                                                    transform: 'scale(1.1) rotate(-5deg)',
                                                    transition: 'transform 0.3s ease',
                                                },
                                            }}
                                        >
                                            ✏️
                                        </Box>
                                        
                                        {/* Edit Profile Text with Gradient */}
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
                                            Edit Profile
                                        </Box>
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500,
                                        }}
                                    >
                                    Update your profile information and preferences
                                </Typography>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Enhanced Alerts */}
                        {error && (
                            <Fade in={true} timeout={800}>
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 3,
                                        borderRadius: '12px',
                                        background: mode === 'dark'
                                            ? 'rgba(244, 67, 54, 0.1)'
                                            : 'rgba(244, 67, 54, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(244, 67, 54, 0.2)',
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {success && (
                            <Fade in={true} timeout={800}>
                                <Alert 
                                    severity="success" 
                                    sx={{ 
                                        mb: 3,
                                        borderRadius: '12px',
                                        background: mode === 'dark'
                                            ? 'rgba(76, 175, 80, 0.1)'
                                            : 'rgba(76, 175, 80, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                    }}
                                >
                                    {success}
                                </Alert>
                            </Fade>
                        )}

                        {/* Enhanced Main Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                            }}
                        >
                            <CardContent sx={{ p: 6 }}>
                                <Box component="form" onSubmit={handleSubmit}>
                                    {/* Enhanced Avatar Section */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: theme.palette.primary.main,
                                                mb: 4,
                                            }}
                                        >
                                            Profile Picture
                                        </Typography>
                                        
                                        <Box sx={{ position: 'relative', mb: 3 }}>
                                            <Avatar
                                                src={previewAvatar}
                                                sx={{ 
                                                    width: 150, 
                                                    height: 150,
                                                    fontSize: '4rem',
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                    border: '4px solid',
                                                    borderColor: mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.1)' 
                                                        : `${currentThemeColors?.primary || '#6366f1'}30`,
                                                    boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                }}
                                            >
                                                {!previewAvatar && formData.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            
                                            {avatarUploading && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: 150,
                                                        height: 150,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                                        borderRadius: '50%',
                                                    }}
                                                >
                                                    <CircularProgress 
                                                        variant="determinate" 
                                                        value={uploadProgress}
                                                        sx={{ color: 'white' }}
                                                        size={60}
                                                    />
                                                </Box>
                                            )}

                                            <IconButton
                                                onClick={handleAvatarSelect}
                                                disabled={avatarUploading}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                    color: 'white',
                                                    width: 56,
                                                    height: 56,
                                                    boxShadow: `0 4px 16px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                    '&:hover': { 
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                                        transform: 'scale(1.1)',
                                                    },
                                                    '&:disabled': {
                                                        background: `${currentThemeColors?.primary || '#6366f1'}80`,
                                                        color: 'white',
                                                    },
                                                }}
                                            >
                                                <PhotoCameraIcon sx={{ fontSize: '1.5rem' }} />
                                            </IconButton>
                                        </Box>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />

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
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                Click the camera icon to change your profile picture
                                                <br />
                                                📏 Recommended: Square image, max 5MB
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    <Divider sx={{ mb: 6 }} />

                                    {/* Enhanced Basic Information */}
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            mb: 3,
                                        }}
                                    >
                                        Basic Information
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        margin="normal"
                                        required
                                        helperText="Your unique username (visible to everyone)"
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
                                    />

                                    <TextField
                                        fullWidth
                                        label="Display Name"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        margin="normal"
                                        helperText="Your display name (optional, shown alongside username)"
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
                                    />

                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        margin="normal"
                                        multiline
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                        helperText="Share something interesting about yourself (max 500 characters)"
                                        inputProps={{ maxLength: 500 }}
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
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {formData.bio.length}/500 characters
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 6 }} />

                                    {/* Enhanced Preferences */}
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            mb: 3,
                                        }}
                                    >
                                        Preferences
                                    </Typography>

                                    <FormControl 
                                        fullWidth 
                                        margin="normal"
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
                                    >
                                        <InputLabel>Theme</InputLabel>
                                        <Select
                                            name="theme"
                                            value={formData.theme}
                                            onChange={handleInputChange}
                                            label="Theme"
                                        >
                                            <MenuItem value="light">🌞 Light Theme</MenuItem>
                                            <MenuItem value="dark">🌙 Dark Theme</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            mt: 3,
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
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name="notifications"
                                                    checked={formData.notifications}
                                                    onChange={handleInputChange}
                                                    sx={{
                                                        '& .MuiSwitch-thumb': {
                                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                        },
                                                        '& .MuiSwitch-track': {
                                                            backgroundColor: mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.2)' 
                                                                : `${currentThemeColors?.primary || '#6366f1'}30`,
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        🔔 Enable notifications
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Receive updates about your memes and interactions
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Paper>

                                    {/* Enhanced Action Buttons */}
                                    <Box sx={{ mt: 6, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancel}
                                            startIcon={<CancelIcon />}
                                            disabled={loading}
                                            sx={{
                                                py: 1.5,
                                                px: 4,
                                                fontWeight: 600,
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                borderColor: theme.palette.primary.main,
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.dark,
                                                    color: theme.palette.primary.dark,
                                                    background: 'rgba(99, 102, 241, 0.05)',
                                                },
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            disabled={loading || avatarUploading}
                                            sx={{
                                                py: 1.5,
                                                px: 4,
                                                fontWeight: 600,
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
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default EditProfile;
