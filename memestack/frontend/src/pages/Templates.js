// 🎨 Templates Page Component
// Browse, create, and manage meme templates

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
    Tab,
    Tabs,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Fade,
    Zoom,
    useTheme,
    Avatar,
    IconButton,
    Tooltip,
    LinearProgress,
    Rating,
    Badge,
} from '@mui/material';
import {
    Palette,
    Add,
    Search,
    TrendingUp,
    Star,
    Visibility,
    Download,
    Share,
    Favorite,
    FavoriteBorder,
    Edit,
    ContentCopy,
    FilterList,
    Sort,
    ViewModule,
    ViewList,
    Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { templatesAPI } from '../services/api';

// Utility function to get full image URL
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If it's already a full URL (starts with http), return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // If it's a local path (starts with /uploads), prepend backend URL
    if (imageUrl.startsWith('/uploads')) {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // Remove /api from base URL if present, since uploads are served from root
        const serverURL = baseURL.replace('/api', '');
        return `${serverURL}${imageUrl}`;
    }
    // For any other format, return as is
    return imageUrl;
};

const Templates = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [favorites, setFavorites] = useState(new Set());

    const categories = [
        'reaction', 'mocking', 'success', 'fail', 'advice',
        'rage', 'philosoraptor', 'first_world_problems', 
        'conspiracy', 'confession', 'socially_awkward',
        'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
    ];

    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'downloads', label: 'Most Downloaded' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'trending', label: 'Trending' }
    ];

    useEffect(() => {
        fetchTemplates();
    }, [tabValue, searchTerm, categoryFilter, sortBy, currentPage]);

    useEffect(() => {
        if (user) {
            loadUserFavorites();
        }
    }, [user]);

    // Listen for when user returns from creating a template
    useEffect(() => {
        const handleFocus = () => {
            // Refresh templates when window gets focus (user navigates back)
            if (tabValue === 2) { // My templates tab
                fetchTemplates();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [tabValue]);

    const loadUserFavorites = async () => {
        try {
            const response = await templatesAPI.getFavoriteTemplates();
            const favoriteIds = new Set(response.templates.map(template => template._id));
            setFavorites(favoriteIds);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const paramsObj = {
                page: currentPage,
                limit: 12,
                sort: sortBy
            };

            if (tabValue === 0) {
                // All templates
                if (searchTerm) paramsObj.search = searchTerm;
                if (categoryFilter) paramsObj.category = categoryFilter;
            } else if (tabValue === 1) {
                // Trending
                const response = await templatesAPI.getTrending();
                setTemplates(response.templates);
                setLoading(false);
                return;
            } else if (tabValue === 2) {
                // My templates
                if (!user) {
                    setTemplates([]);
                    setLoading(false);
                    return;
                }
                const response = await templatesAPI.getUserTemplates();
                setTemplates(response.templates);
                setLoading(false);
                return;
            } else if (tabValue === 3) {
                // Favorites
                if (!user) {
                    setTemplates([]);
                    setLoading(false);
                    return;
                }
                const response = await templatesAPI.getFavoriteTemplates();
                setTemplates(response.templates);
                setLoading(false);
                return;
            }

            const response = await templatesAPI.getTemplates(paramsObj);
            setTemplates(response.templates);
            setTotalPages(response.pagination.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (templateId) => {
        try {
            if (favorites.has(templateId)) {
                await templatesAPI.unfavoriteTemplate(templateId);
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    newFavorites.delete(templateId);
                    return newFavorites;
                });
            } else {
                await templatesAPI.favoriteTemplate(templateId);
                setFavorites(prev => new Set([...prev, templateId]));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleUseTemplate = async (template) => {
        try {
            // Track template usage
            await templatesAPI.trackTemplateUsage(template._id);
            
            // Navigate to create page
            navigate(`/create?template=${template._id}`);
        } catch (error) {
            console.error('Error tracking template usage:', error);
            // Still navigate even if tracking fails
            navigate(`/create?template=${template._id}`);
        }
    };

    const handleDownloadTemplate = async (template, event) => {
        event.stopPropagation(); // Prevent card click
        try {
            // Use the proper download API endpoint
            await templatesAPI.downloadTemplate(template._id);
            
            // Create download link for the image
            const imageUrl = getImageUrl(template.imageUrl);
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${template.name}.${template.imageUrl.split('.').pop()}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading template:', error);
            // Fallback: open image in new tab
            const imageUrl = getImageUrl(template.imageUrl);
            window.open(imageUrl, '_blank');
        }
    };

    const handleRateTemplate = async (template, newRating, event) => {
        event.stopPropagation(); // Prevent card click
        if (!user) {
            // Could show login prompt here
            return;
        }
        
        try {
            await templatesAPI.rateTemplate(template._id, newRating);
            
            // Update the template in the list
            setTemplates(prevTemplates => 
                prevTemplates.map(t => 
                    t._id === template._id 
                        ? {
                            ...t,
                            averageRating: newRating, // Simplified - in reality would recalculate average
                            ratingCount: (t.ratingCount || 0) + 1
                          }
                        : t
                )
            );
        } catch (error) {
            console.error('Error rating template:', error);
        }
    };

    const handleDeleteTemplate = async (templateId, event) => {
        event.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            await templatesAPI.deleteTemplate(templateId);
            // Remove the deleted template from the state
            setTemplates(prevTemplates => 
                prevTemplates.filter(t => t._id !== templateId)
            );
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template. Please try again.');
        }
    };

    const TemplateCard = ({ template }) => {
        // Check if current user is the owner
        const isOwner = user && template.createdBy && (
            template.createdBy._id === user._id || 
            template.createdBy._id === user.userId ||
            template.createdBy === user._id ||
            template.createdBy === user.userId
        );

        return (
        <Zoom in={true} timeout={600}>
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: theme.palette.mode === 'dark'
                        ? '2px solid rgba(255, 255, 255, 0.3)'
                        : '2px solid rgba(0, 0, 0, 0.15)',
                    borderTop: theme.palette.mode === 'dark'
                        ? '3px solid rgba(255, 255, 255, 0.4)'
                        : '3px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '20px',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                        : '0 8px 32px rgba(31, 38, 135, 0.2)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                        border: theme.palette.mode === 'dark'
                            ? '2px solid rgba(255, 255, 255, 0.4)'
                            : '2px solid rgba(0, 0, 0, 0.25)',
                        borderTop: theme.palette.mode === 'dark'
                            ? '3px solid rgba(255, 255, 255, 0.6)'
                            : '3px solid rgba(0, 0, 0, 0.3)',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 12px 48px rgba(0, 0, 0, 0.6)'
                            : '0 12px 48px rgba(31, 38, 135, 0.3)',
                    },
                }}
                onClick={() => navigate(`/templates/${template._id}`)}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(template.imageUrl)}
                        alt={template.name}
                        sx={{
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                    />
                    
                    {/* Overlay controls */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        {user && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(template._id);
                                }}
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
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                {favorites.has(template._id) ? 
                                    <Favorite sx={{ color: '#e91e63' }} /> : 
                                    <FavoriteBorder />
                                }
                            </IconButton>
                        )}

                        {/* Delete button for template owner */}
                        {isOwner && (
                            <IconButton
                                size="small"
                                onClick={(e) => handleDeleteTemplate(template._id, e)}
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
                                        color: theme.palette.mode === 'dark' ? 'white' : 'error.dark',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                                title="Delete template"
                            >
                                <Delete />
                            </IconButton>
                        )}
                        
                        <Chip
                            label={template.category}
                            size="small"
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
                            }}
                        />
                    </Box>

                    {/* Template rating */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            px: 1,
                            py: 0.5,
                        }}
                    >
                        <Rating
                            value={template.averageRating || 0}
                            readOnly={!user}
                            size="small"
                            precision={0.5}
                            onChange={(event, newValue) => handleRateTemplate(template, newValue, event)}
                            sx={{
                                '& .MuiRating-iconFilled': {
                                    color: '#ffc107',
                                },
                                '& .MuiRating-iconHover': {
                                    color: '#ffb300',
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                            ({template.ratingCount || 0})
                        </Typography>
                    </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {template.name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Avatar
                            src={getImageUrl(template.createdBy?.profile?.avatar)}
                            sx={{
                                width: 24,
                                height: 24,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                            }}
                        >
                            {template.createdBy?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            by {template.createdBy?.profile?.displayName || template.createdBy?.username || 'Unknown'}
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                            <Box 
                                display="flex" 
                                alignItems="center" 
                                gap={0.5}
                                sx={{ 
                                    cursor: 'pointer',
                                    p: 0.5,
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                                onClick={(e) => handleDownloadTemplate(template, e)}
                                title="Download template"
                            >
                                <Download fontSize="small" color="action" />
                                <Typography variant="caption">
                                    {template.downloadCount || 0}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Visibility fontSize="small" color="action" />
                                <Typography variant="caption">
                                    {template.viewCount || 0}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Star fontSize="small" sx={{ color: '#fbbf24' }} />
                                <Typography variant="caption">
                                    {template.favoriteCount || 0}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                        }}
                        sx={{
                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                            fontWeight: 600,
                            borderRadius: '12px',
                            textTransform: 'none',
                            py: 1,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b5bf6'}, ${currentThemeColors?.secondaryHover || '#7c3aed'})`,
                            },
                        }}
                    >
                        Use Template
                    </Button>
                </CardContent>
            </Card>
        </Zoom>
        );
    };

    const CreateTemplateDialog = () => (
        <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Template</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Share your creativity! Create reusable meme templates for the community.
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        setCreateDialogOpen(false);
                        navigate('/templates/create');
                    }}
                    sx={{ mt: 2 }}
                >
                    Create Template
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="lg">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Enhanced Header */}
                        <Zoom in={true} timeout={1200}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                    backdropFilter: 'blur(50px)',
                                    WebkitBackdropFilter: 'blur(50px)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderTop: theme.palette.mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.4)'
                                        : '3px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: '24px',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box sx={{ position: 'relative', textAlign: 'center', width: '100%' }}>
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
                                                gap: 2,
                                            }}
                                        >
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(5deg) saturate(1.1) brightness(1.05)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                🎨
                                            </Box>
                                            
                                            <Box
                                                component="span"
                                                sx={{
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
                                                Meme Templates
                                            </Box>
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Discover and create amazing meme templates for everyone!
                                        </Typography>
                                    </Box>
                                    
                                    {user && (
                                        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add sx={{ color: 'inherit' }} />}
                                                onClick={() => setCreateDialogOpen(true)}
                                                size="large"
                                                sx={{
                                                    py: 1.5,
                                                    px: 3,
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
                                                }}
                                            >
                                                Create Template
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Enhanced Tabs */}
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 4,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: theme.palette.mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2)',
                                overflow: 'hidden',
                            }}
                        >
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTab-root': {
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        py: 2,
                                    }
                                }}
                            >
                                <Tab label="All Templates" icon={<Palette sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />
                                <Tab label="Trending" icon={<TrendingUp sx={{ color: currentThemeColors?.secondary || 'secondary.main' }} />} iconPosition="start" />
                                {user && <Tab label="My Templates" icon={<Star sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />}
                                {user && <Tab label="Favorites" icon={<Favorite sx={{ color: '#e91e63' }} />} iconPosition="start" />}
                            </Tabs>
                        </Paper>

                        {/* Enhanced Filters */}
                        {tabValue === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 4,
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                    backdropFilter: 'blur(40px)',
                                    WebkitBackdropFilter: 'blur(40px)',
                                    border: theme.palette.mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderRadius: '16px',
                                }}
                            >
                                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                                    <TextField
                                        placeholder="Search templates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                                        }}
                                        sx={{
                                            minWidth: 250,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    />

                                    <FormControl
                                        size="small"
                                        sx={{
                                            minWidth: 150,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    >
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            label="Category"
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl
                                        size="small"
                                        sx={{
                                            minWidth: 150,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    >
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            label="Sort By"
                                        >
                                            {sortOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                        <Tooltip title="Grid View">
                                            <IconButton
                                                onClick={() => setViewMode('grid')}
                                                sx={{
                                                    background: viewMode === 'grid' 
                                                        ? `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`
                                                        : 'transparent',
                                                    color: viewMode === 'grid' ? 'white' : 'text.secondary',
                                                }}
                                            >
                                                <ViewModule />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="List View">
                                            <IconButton
                                                onClick={() => setViewMode('list')}
                                                sx={{
                                                    background: viewMode === 'list' 
                                                        ? `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`
                                                        : 'transparent',
                                                    color: viewMode === 'list' ? 'white' : 'text.secondary',
                                                }}
                                            >
                                                <ViewList />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                        {/* Loading */}
                        {loading && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 3,
                                    background: mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(99, 102, 241, 0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                }}
                            >
                                <LinearProgress
                                    sx={{
                                        background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        '& .MuiLinearProgress-bar': {
                                            background: `linear-gradient(90deg, ${currentThemeColors?.accent || '#ec4899'}, ${currentThemeColors?.highlight || '#f97316'})`,
                                        },
                                    }}
                                />
                            </Paper>
                        )}

                        {/* Enhanced Templates Grid */}
                        <Grid container spacing={3}>
                            {templates.map((template) => (
                                <Grid item xs={12} sm={6} md={4} key={template._id}>
                                    <TemplateCard template={template} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Enhanced Empty State */}
                        {!loading && templates.length === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    background: mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(99, 102, 241, 0.1)',
                                    borderRadius: '20px',
                                }}
                            >
                                <Palette sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h5" color="text.secondary" gutterBottom>
                                    No templates found
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    {tabValue === 2
                                        ? "You haven't created any templates yet."
                                        : tabValue === 3
                                        ? "You haven't favorited any templates yet."
                                        : "Be the first to create a meme template!"
                                    }
                                </Typography>
                                {user && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Add sx={{ color: 'inherit' }} />}
                                        onClick={() => setCreateDialogOpen(true)}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                            textTransform: 'none',
                                            boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b5bf6'}, ${currentThemeColors?.secondaryHover || '#7c3aed'})`,
                                                boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        Create Template
                                    </Button>
                                )}
                            </Paper>
                        )}

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        background: mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(20px)',
                                        border: mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                        borderRadius: '16px',
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '10px',
                                                '&:disabled': { opacity: 0.5 },
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Typography sx={{ mx: 2, fontWeight: 600 }}>
                                            {currentPage} of {totalPages}
                                        </Typography>
                                        <Button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '10px',
                                                '&:disabled': { opacity: 0.5 },
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        <CreateTemplateDialog />
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Templates;
