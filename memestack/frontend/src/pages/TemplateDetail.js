// 🎨 Template Detail Page Component
// View individual template details and create memes from templates

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Box,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Rating,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    Fade,
    Zoom,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack,
    Favorite,
    FavoriteBorder,
    Download,
    Share,
    Edit,
    ContentCopy,
    Star,
    Visibility,
    Comment,
    Send,
    MoreVert,
    Flag,
    Delete,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { templatesAPI } from '../services/api_clean';
import CommentSection from '../components/comments/CommentSection';

// Utility function to get full image URL
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const serverURL = baseURL.replace('/api', '');
        return `${serverURL}${imageUrl}`;
    }
    return imageUrl;
};

const TemplateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [hasTrackedView, setHasTrackedView] = useState(false);

    useEffect(() => {
        fetchTemplate();
    }, [id]);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const response = await templatesAPI.getTemplateById(id);
            setTemplate(response.template);
            
            // Track view only once per session
            if (!hasTrackedView) {
                setHasTrackedView(true);
            }
            
            // Check if user has favorited this template
            if (user) {
                const favoritesResponse = await templatesAPI.getFavoriteTemplates();
                const favoriteIds = favoritesResponse.templates.map(t => t._id);
                setIsFavorite(favoriteIds.includes(id));
            }
        } catch (error) {
            console.error('Error fetching template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async () => {
        try {
            // Track template usage
            await templatesAPI.trackTemplateUsage(template._id);
            
            // Update usage count in UI
            setTemplate(prev => ({
                ...prev,
                usageCount: (prev.usageCount || 0) + 1
            }));
            
            // Navigate to create page
            navigate(`/create?template=${template._id}`);
        } catch (error) {
            console.error('Error tracking template usage:', error);
            // Still navigate even if tracking fails
            navigate(`/create?template=${template._id}`);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) return;
        
        try {
            if (isFavorite) {
                await templatesAPI.unfavoriteTemplate(id);
                setIsFavorite(false);
                setTemplate(prev => ({
                    ...prev,
                    favoriteCount: (prev.favoriteCount || 0) - 1
                }));
            } else {
                await templatesAPI.favoriteTemplate(id);
                setIsFavorite(true);
                setTemplate(prev => ({
                    ...prev,
                    favoriteCount: (prev.favoriteCount || 0) + 1
                }));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDownload = async () => {
        try {
            // Use the proper download API endpoint
            await templatesAPI.downloadTemplate(id);
            
            // Then create a download link for the image
            const imageUrl = getImageUrl(template.imageUrl);
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${template.name}.${template.imageUrl.split('.').pop()}`;
            link.target = '_blank'; // Open in new tab if direct download fails
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update download count in UI
            setTemplate(prev => ({
                ...prev,
                downloadCount: (prev.downloadCount || 0) + 1
            }));
        } catch (error) {
            console.error('Error downloading template:', error);
            // Fallback: just open the image in a new tab
            const imageUrl = getImageUrl(template.imageUrl);
            window.open(imageUrl, '_blank');
        }
    };

    const handleShare = () => {
        setShareDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            await templatesAPI.deleteTemplate(id);
            alert('Template deleted successfully');
            // Navigate back to templates page after deletion
            navigate('/templates');
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    if (loading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh' 
                }}
            >
                <CircularProgress 
                    sx={{ 
                        color: currentThemeColors?.primary || '#6366f1' 
                    }} 
                />
            </Box>
        );
    }

    if (!template) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">
                        Template not found
                    </Typography>
                    <Button 
                        onClick={() => navigate('/templates')} 
                        sx={{ mt: 2 }}
                    >
                        Back to Templates
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="lg">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Back Button */}
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/templates')}
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                borderRadius: '12px',
                                textTransform: 'none',
                            }}
                        >
                            Back to Templates
                        </Button>

                        <Grid container spacing={4}>
                            {/* Template Image */}
                            <Grid item xs={12} md={6}>
                                <Zoom in={true} timeout={800}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                            backdropFilter: 'blur(40px)',
                                            WebkitBackdropFilter: 'blur(40px)',
                                            border: theme.palette.mode === 'dark'
                                                ? '2px solid rgba(255, 255, 255, 0.3)'
                                                : '2px solid rgba(0, 0, 0, 0.15)',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            boxShadow: theme.palette.mode === 'dark'
                                                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                image={getImageUrl(template.imageUrl)}
                                                alt={template.name}
                                                sx={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    maxHeight: '500px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                            
                                            {/* Overlay Actions */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 16,
                                                    right: 16,
                                                    display: 'flex',
                                                    gap: 1,
                                                }}
                                            >
                                                {user && (
                                                    <IconButton
                                                        onClick={handleToggleFavorite}
                                                        sx={{
                                                            background: theme.palette.mode === 'dark' 
                                                                ? 'rgba(0, 0, 0, 0.8)' 
                                                                : 'rgba(255, 255, 255, 0.95)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: theme.palette.mode === 'dark'
                                                                ? '1px solid rgba(255, 255, 255, 0.2)'
                                                                : '1px solid rgba(0, 0, 0, 0.1)',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                                                                : '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                            color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            '&:hover': { 
                                                                background: theme.palette.mode === 'dark'
                                                                    ? 'rgba(0, 0, 0, 0.9)'
                                                                    : 'rgba(255, 255, 255, 1)',
                                                                transform: 'scale(1.1)',
                                                            }
                                                        }}
                                                    >
                                                        {isFavorite ? 
                                                            <Favorite sx={{ color: '#e91e63' }} /> : 
                                                            <FavoriteBorder />
                                                        }
                                                    </IconButton>
                                                )}
                                                
                                                <IconButton
                                                    onClick={handleDownload}
                                                    sx={{
                                                        background: theme.palette.mode === 'dark' 
                                                            ? 'rgba(0, 0, 0, 0.8)' 
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.2)'
                                                            : '1px solid rgba(0, 0, 0, 0.1)',
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                        color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                        '&:hover': { 
                                                            background: theme.palette.mode === 'dark'
                                                                ? 'rgba(0, 0, 0, 0.9)'
                                                                : 'rgba(255, 255, 255, 1)',
                                                            transform: 'scale(1.1)',
                                                        }
                                                    }}
                                                >
                                                    <Download />
                                                </IconButton>
                                                
                                                <IconButton
                                                    onClick={handleShare}
                                                    sx={{
                                                        background: theme.palette.mode === 'dark' 
                                                            ? 'rgba(0, 0, 0, 0.8)' 
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.2)'
                                                            : '1px solid rgba(0, 0, 0, 0.1)',
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                        color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                        '&:hover': { 
                                                            background: theme.palette.mode === 'dark'
                                                                ? 'rgba(0, 0, 0, 0.9)'
                                                                : 'rgba(255, 255, 255, 1)',
                                                            transform: 'scale(1.1)',
                                                        }
                                                    }}
                                                >
                                                    <Share />
                                                </IconButton>

                                                {/* Delete button for template owner */}
                                                {user && template.createdBy && (
                                                    user._id === template.createdBy._id || 
                                                    user._id === template.createdBy.id ||
                                                    user.userId === template.createdBy._id ||
                                                    user.userId === template.createdBy.id
                                                ) && (
                                                    <IconButton
                                                        onClick={handleDelete}
                                                        sx={{
                                                            background: theme.palette.mode === 'dark' 
                                                                ? 'rgba(244, 67, 54, 0.9)' 
                                                                : 'rgba(255, 255, 255, 0.95)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: theme.palette.mode === 'dark'
                                                                ? '1px solid rgba(255, 255, 255, 0.2)'
                                                                : '1px solid rgba(244, 67, 54, 0.3)',
                                                            boxShadow: theme.palette.mode === 'dark'
                                                                ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                                                                : '0 2px 8px rgba(244, 67, 54, 0.2)',
                                                            color: theme.palette.mode === 'dark' ? 'white' : 'error.main',
                                                            '&:hover': { 
                                                                background: theme.palette.mode === 'dark'
                                                                    ? 'rgba(244, 67, 54, 1)'
                                                                    : 'rgba(244, 67, 54, 0.1)',
                                                                transform: 'scale(1.1)',
                                                                color: theme.palette.mode === 'dark' ? 'white' : 'error.dark'
                                                            }
                                                        }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                )}
                                            </Box>

                                            {/* Category Chip */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 16,
                                                    left: 16,
                                                }}
                                            >
                                                <Chip
                                                    label={template.category}
                                                    sx={{
                                                        background: theme.palette.mode === 'dark' 
                                                            ? 'rgba(0, 0, 0, 0.8)' 
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.2)'
                                                            : '1px solid rgba(0, 0, 0, 0.1)',
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                        color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Zoom>
                            </Grid>

                            {/* Template Details */}
                            <Grid item xs={12} md={6}>
                                <Fade in={true} timeout={1200}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                            backdropFilter: 'blur(40px)',
                                            WebkitBackdropFilter: 'blur(40px)',
                                            border: theme.palette.mode === 'dark'
                                                ? '2px solid rgba(255, 255, 255, 0.3)'
                                                : '2px solid rgba(0, 0, 0, 0.15)',
                                            borderRadius: '20px',
                                            boxShadow: theme.palette.mode === 'dark'
                                                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                        }}
                                    >
                                        {/* Template Title */}
                                        <Typography
                                            variant="h4"
                                            component="h1"
                                            sx={{
                                                fontWeight: 800,
                                                mb: 2,
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                color: 'transparent',
                                                '@supports not (-webkit-background-clip: text)': {
                                                    background: 'none',
                                                    color: currentThemeColors?.primary || '#6366f1',
                                                },
                                            }}
                                        >
                                            {template.name}
                                        </Typography>

                                        {/* Creator Info */}
                                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                                            <Avatar
                                                src={getImageUrl(template.createdBy?.profile?.avatar)}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                }}
                                            >
                                                {template.createdBy?.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.9)' 
                                                            : 'rgba(0, 0, 0, 0.87)'
                                                    }}
                                                >
                                                    {template.createdBy?.profile?.displayName || template.createdBy?.username || 'Unknown'}
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{
                                                        color: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.6)' 
                                                            : 'rgba(0, 0, 0, 0.6)'
                                                    }}
                                                >
                                                    Created {new Date(template.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Description */}
                                        {template.description && (
                                            <Box mb={3}>
                                                <Typography 
                                                    variant="body1" 
                                                    sx={{ 
                                                        lineHeight: 1.6,
                                                        color: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.8)' 
                                                            : 'rgba(0, 0, 0, 0.8)'
                                                    }}
                                                >
                                                    {template.description}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Tags */}
                                        {template.tags && template.tags.length > 0 && (
                                            <Box mb={3}>
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        mb: 1, 
                                                        fontWeight: 600,
                                                        color: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.9)' 
                                                            : 'rgba(0, 0, 0, 0.87)'
                                                    }}
                                                >
                                                    Tags
                                                </Typography>
                                                <Box display="flex" flexWrap="wrap" gap={1}>
                                                    {template.tags.map((tag, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={tag}
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.mode === 'dark'
                                                                    ? `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}30, ${currentThemeColors?.secondary || '#8b5cf6'}30)`
                                                                    : `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}20, ${currentThemeColors?.secondary || '#8b5cf6'}20)`,
                                                                border: `1px solid ${currentThemeColors?.primary || '#6366f1'}40`,
                                                                color: theme.palette.mode === 'dark' 
                                                                    ? 'rgba(255, 255, 255, 0.9)' 
                                                                    : 'rgba(0, 0, 0, 0.8)'
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Stats */}
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={6}>
                                                <Box textAlign="center">
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.9)' 
                                                                : 'rgba(0, 0, 0, 0.87)'
                                                        }}
                                                    >
                                                        {template.viewCount || 0}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.6)' 
                                                                : 'rgba(0, 0, 0, 0.6)'
                                                        }}
                                                    >
                                                        Views
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box textAlign="center">
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.9)' 
                                                                : 'rgba(0, 0, 0, 0.87)'
                                                        }}
                                                    >
                                                        {template.usageCount || 0}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.6)' 
                                                                : 'rgba(0, 0, 0, 0.6)'
                                                        }}
                                                    >
                                                        Uses
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box textAlign="center">
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.9)' 
                                                                : 'rgba(0, 0, 0, 0.87)'
                                                        }}
                                                    >
                                                        {template.downloadCount || 0}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.6)' 
                                                                : 'rgba(0, 0, 0, 0.6)'
                                                        }}
                                                    >
                                                        Downloads
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box textAlign="center">
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.9)' 
                                                                : 'rgba(0, 0, 0, 0.87)'
                                                        }}
                                                    >
                                                        {template.favoriteCount || 0}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{
                                                            color: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255, 255, 255, 0.6)' 
                                                                : 'rgba(0, 0, 0, 0.6)'
                                                        }}
                                                    >
                                                        Favorites
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Rating */}
                                        <Box textAlign="center" sx={{ mb: 3 }}>
                                            <Rating
                                                value={template.averageRating || 0}
                                                readOnly
                                                precision={0.1}
                                                size="large"
                                            />
                                            <Typography 
                                                variant="caption" 
                                                display="block"
                                                sx={{
                                                    color: theme.palette.mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.6)' 
                                                        : 'rgba(0, 0, 0, 0.6)'
                                                }}
                                            >
                                                ({template.ratingCount || 0} ratings)
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 3 }} />

                                        {/* Action Buttons */}
                                        <Box display="flex" gap={2} flexWrap="wrap">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={handleUseTemplate}
                                                sx={{
                                                    flex: 1,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                    textTransform: 'none',
                                                    boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}40`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b5bf6'}, ${currentThemeColors?.secondaryHover || '#7c3aed'})`,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                    },
                                                }}
                                            >
                                                Use This Template
                                            </Button>

                                            {user && user._id === template.createdBy?._id && (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Edit />}
                                                    onClick={() => navigate('/templates')}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Manage Templates
                                                </Button>
                                            )}
                                        </Box>
                                    </Paper>
                                </Fade>
                            </Grid>
                        </Grid>

                        {/* Comments Section */}
                        <Box sx={{ mt: 6 }}>
                            <CommentSection 
                                memeId={id} 
                                contentType="template"
                                apiEndpoint={`templates/${id}/comments`}
                            />
                        </Box>

                        {/* Share Dialog */}
                        <Dialog
                            open={shareDialogOpen}
                            onClose={() => setShareDialogOpen(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle>Share Template</DialogTitle>
                            <DialogContent>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <TextField
                                        label="Template Link"
                                        value={window.location.href}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <IconButton onClick={() => copyToClipboard(window.location.href)}>
                                                    <ContentCopy />
                                                </IconButton>
                                            ),
                                        }}
                                        fullWidth
                                    />
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default TemplateDetail;
