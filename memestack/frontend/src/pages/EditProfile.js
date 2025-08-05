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
} from '@mui/material';
import {
    PhotoCamera as PhotoCameraIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadAPI } from '../services/api';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const fileInputRef = useRef(null);

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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                ✏️ Edit Profile
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Update your profile information and preferences
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Profile Picture
                            </Typography>
                            
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar
                                    src={previewAvatar}
                                    sx={{ 
                                        width: 120, 
                                        height: 120,
                                        fontSize: '3rem',
                                        bgcolor: 'primary.main'
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
                                            width: 120,
                                            height: 120,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            borderRadius: '50%',
                                        }}
                                    >
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={uploadProgress}
                                            sx={{ color: 'white' }}
                                        />
                                    </Box>
                                )}

                                <IconButton
                                    onClick={handleAvatarSelect}
                                    disabled={avatarUploading}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                >
                                    <PhotoCameraIcon />
                                </IconButton>
                            </Box>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                Click the camera icon to change your profile picture
                                <br />
                                Recommended: Square image, max 5MB
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Basic Information */}
                        <Typography variant="h6" gutterBottom>
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
                        />

                        <TextField
                            fullWidth
                            label="Display Name"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            margin="normal"
                            helperText="Your display name (optional, shown alongside username)"
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
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {formData.bio.length}/500 characters
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Preferences */}
                        <Typography variant="h6" gutterBottom>
                            Preferences
                        </Typography>

                        <FormControl fullWidth margin="normal">
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

                        <FormControlLabel
                            control={
                                <Switch
                                    name="notifications"
                                    checked={formData.notifications}
                                    onChange={handleInputChange}
                                />
                            }
                            label="Enable notifications"
                            sx={{ mt: 2 }}
                        />

                        {/* Action Buttons */}
                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<CancelIcon />}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={loading || avatarUploading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default EditProfile;
