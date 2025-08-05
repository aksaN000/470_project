// ⚙️ Account Settings Page Component
// Comprehensive account settings management

import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert,
    Divider,
    Grid,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
} from '@mui/material';
import {
    Save as SaveIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Palette as PaletteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Language as LanguageIcon,
    DataUsage as DataUsageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AccountSettings = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { mode, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        username: user?.username || '',
        displayName: user?.profile?.displayName || '',
        email: user?.email || '',
        bio: user?.profile?.bio || '',
        theme: user?.preferences?.theme || 'light',
        notifications: user?.preferences?.notifications !== false,
        emailNotifications: user?.preferences?.emailNotifications !== false,
        language: user?.preferences?.language || 'en',
        dataUsage: user?.preferences?.dataUsage || 'standard',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
        setSuccess('');
    };

    const handleThemeChange = (newTheme) => {
        setFormData(prev => ({ ...prev, theme: newTheme }));
        // Immediately apply theme change
        if (newTheme !== mode) {
            toggleTheme();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('💾 Updating account settings...');
            const result = await updateProfile({
                username: formData.username,
                displayName: formData.displayName,
                bio: formData.bio,
                theme: formData.theme,
                notifications: formData.notifications,
                emailNotifications: formData.emailNotifications,
                language: formData.language,
                dataUsage: formData.dataUsage,
            });
            
            if (result.success) {
                setSuccess('Account settings updated successfully!');
                console.log('✅ Account settings updated successfully');
            } else {
                throw new Error(result.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('❌ Settings update error:', error);
            setError(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                ⚙️ Account Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Manage your account preferences and personal information
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

            <Box component="form" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon /> Personal Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Display Name"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    helperText="Name shown to other users (optional)"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    type="email"
                                    disabled
                                    helperText="Email cannot be changed from settings"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    multiline
                                    rows={3}
                                    placeholder="Tell others about yourself..."
                                    helperText={`${formData.bio.length}/500 characters`}
                                    inputProps={{ maxLength: 500 }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PaletteIcon /> Appearance
                        </Typography>

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                                </ListItemIcon>
                                <ListItemText
                                    primary="Theme"
                                    secondary={`Current: ${mode === 'dark' ? 'Dark' : 'Light'} theme`}
                                />
                                <ListItemSecondaryAction>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            icon={<LightModeIcon />}
                                            label="Light"
                                            clickable
                                            color={formData.theme === 'light' ? 'primary' : 'default'}
                                            onClick={() => handleThemeChange('light')}
                                        />
                                        <Chip
                                            icon={<DarkModeIcon />}
                                            label="Dark"
                                            clickable
                                            color={formData.theme === 'dark' ? 'primary' : 'default'}
                                            onClick={() => handleThemeChange('dark')}
                                        />
                                    </Box>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NotificationsIcon /> Notifications
                        </Typography>

                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Push Notifications"
                                    secondary="Receive notifications about likes, comments, and follows"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        name="notifications"
                                        checked={formData.notifications}
                                        onChange={handleInputChange}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <EmailIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Email Notifications"
                                    secondary="Receive email updates about your account activity"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        name="emailNotifications"
                                        checked={formData.emailNotifications}
                                        onChange={handleInputChange}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Privacy & Data Settings */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon /> Privacy & Data
                        </Typography>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Language</InputLabel>
                            <Select
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                label="Language"
                            >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Español</MenuItem>
                                <MenuItem value="fr">Français</MenuItem>
                                <MenuItem value="de">Deutsch</MenuItem>
                                <MenuItem value="it">Italiano</MenuItem>
                                <MenuItem value="pt">Português</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Data Usage</InputLabel>
                            <Select
                                name="dataUsage"
                                value={formData.dataUsage}
                                onChange={handleInputChange}
                                label="Data Usage"
                            >
                                <MenuItem value="low">Low Quality (Save Data)</MenuItem>
                                <MenuItem value="standard">Standard Quality</MenuItem>
                                <MenuItem value="high">High Quality</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/profile')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default AccountSettings;
