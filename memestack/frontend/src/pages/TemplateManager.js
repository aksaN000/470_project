import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Menu,
    ListItemIcon,
    ListItemText,
    Divider,
    Switch,
    FormControlLabel,
    Tooltip,
    Fab,
    Paper,
    Fade,
    Zoom,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    CloudUpload as CloudUploadIcon,
    Category as CategoryIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
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

const TemplateManager = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode() || { mode: 'light', currentThemeColors: null };
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMyTemplates, setShowMyTemplates] = useState(false);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        description: '',
        isPublic: false,
        image: null
    });

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        loadTemplates();
        loadCategories();
    }, [page, selectedCategory, searchTerm, showMyTemplates]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 12,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                search: searchTerm || undefined
            };

            const response = showMyTemplates 
                ? await templatesAPI.getUserTemplates(params)
                : await templatesAPI.getTemplates(params);

            setTemplates(response.templates);
            setTotalPages(response.pagination.totalPages);
            setHasNext(response.pagination.hasNext);
        } catch (error) {
            setError(error.message || 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await templatesAPI.getCategories();
            setCategories(response.categories);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleCreateTemplate = async () => {
        try {
            setLoading(true);
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('isPublic', formData.isPublic);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            
            await templatesAPI.createTemplate(formDataToSend);
            setSuccess('Template created successfully!');
            setCreateDialogOpen(false);
            resetForm();
            loadTemplates();
        } catch (error) {
            setError(error.message || 'Failed to create template');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTemplate = async () => {
        try {
            setLoading(true);
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('isPublic', formData.isPublic);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            
            await templatesAPI.updateTemplate(selectedTemplate._id, formDataToSend);
            setSuccess('Template updated successfully!');
            setEditDialogOpen(false);
            resetForm();
            loadTemplates();
        } catch (error) {
            setError(error.message || 'Failed to update template');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async () => {
        try {
            setLoading(true);
            await templatesAPI.deleteTemplate(selectedTemplate._id);
            setSuccess('Template deleted successfully!');
            setDeleteDialogOpen(false);
            setSelectedTemplate(null);
            loadTemplates();
        } catch (error) {
            setError(error.message || 'Failed to delete template');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'general',
            description: '',
            isPublic: false,
            image: null
        });
        setSelectedTemplate(null);
    };

    const openEditDialog = (template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            category: template.category,
            description: template.description || '',
            isPublic: template.isPublic,
            image: null
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (template) => {
        setSelectedTemplate(template);
        setDeleteDialogOpen(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setFormData({ ...formData, image: file });
        }
    };

    const handleMenuClick = (event, template) => {
        setAnchorEl(event.currentTarget);
        setSelectedTemplate(template);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTemplate(null);
    };

    const canEditTemplate = (template) => {
        return template.creator._id === user._id;
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="xl">
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
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                    backdropFilter: 'blur(50px)',
                                    WebkitBackdropFilter: 'blur(50px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.4)'
                                        : '3px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: '24px',
                                    boxShadow: mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        background: mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.4)'
                                            : '2px solid rgba(0, 0, 0, 0.25)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.5)'
                                            : '3px solid rgba(0, 0, 0, 0.3)',
                                        boxShadow: mode === 'dark'
                                            ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                            : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                    },
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
                                                gap: 1.5
                                            }}
                                        >
                                            {/* Artist Palette Emoji - Separate for Natural Colors */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(0deg) saturate(1.1) brightness(1.05)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(-10deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                🎨
                                            </Box>
                                            
                                            {/* Meme Templates Text with Gradient */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
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
                                            Create and manage your meme templates collection
                                        </Typography>
                                    </Box>
                                    
                                    {/* Absolutely positioned Fab button */}
                                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                        <Fab
                                            color="primary"
                                            aria-label="add"
                                            onClick={() => setCreateDialogOpen(true)}
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                                                boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b21b6'} 0%, ${currentThemeColors?.secondaryHover || '#7c3aed'} 100%)`,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                },
                                            }}
                                        >
                                            <AddIcon />
                                        </Fab>
                                    </Box>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                backdropFilter: 'blur(50px)',
                                WebkitBackdropFilter: 'blur(50px)',
                                border: mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                p: 4,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        >
            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                label="Category"
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showMyTemplates}
                                    onChange={(e) => setShowMyTemplates(e.target.checked)}
                                />
                            }
                            label="My Templates Only"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Templates Grid */}
            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {templates.map((template) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={template._id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    background: mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                    backdropFilter: 'blur(40px)',
                                    WebkitBackdropFilter: 'blur(40px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.4)'
                                        : '3px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: '16px',
                                    boxShadow: mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        background: mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.4)'
                                            : '2px solid rgba(0, 0, 0, 0.25)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.5)'
                                            : '3px solid rgba(0, 0, 0, 0.3)',
                                        boxShadow: mode === 'dark'
                                            ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                            : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                    },
                                }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={getImageUrl(template.imageUrl)}
                                        alt={template.name}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" gutterBottom noWrap>
                                            {template.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {template.description || 'No description'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                                            <Chip
                                                label={template.category}
                                                size="small"
                                                icon={<CategoryIcon />}
                                                sx={{
                                                    background: mode === 'dark'
                                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                                                    backdropFilter: 'blur(20px)',
                                                    WebkitBackdropFilter: 'blur(20px)',
                                                    border: mode === 'dark'
                                                        ? '1px solid rgba(255, 255, 255, 0.3)'
                                                        : '1px solid rgba(0, 0, 0, 0.2)',
                                                    color: mode === 'dark' ? 'white' : 'black',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    boxShadow: mode === 'dark'
                                                        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                                }}
                                            />
                                            {template.isPublic ? (
                                                <Chip
                                                    label="Public"
                                                    size="small"
                                                    color="success"
                                                    icon={<VisibilityIcon />}
                                                    sx={{
                                                        background: mode === 'dark'
                                                            ? 'linear-gradient(145deg, rgba(0, 120, 0, 0.3) 0%, rgba(0, 100, 0, 0.1) 100%)'
                                                            : 'linear-gradient(145deg, rgba(76, 175, 80, 0.8) 0%, rgba(76, 175, 80, 0.4) 100%)',
                                                        backdropFilter: 'blur(20px)',
                                                        WebkitBackdropFilter: 'blur(20px)',
                                                        border: mode === 'dark'
                                                            ? '1px solid rgba(76, 175, 80, 0.5)'
                                                            : '1px solid rgba(76, 175, 80, 0.3)',
                                                        color: mode === 'dark' ? '#4caf50' : 'white',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        boxShadow: mode === 'dark'
                                                            ? 'inset 0 1px 0 rgba(76, 175, 80, 0.3)'
                                                            : 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                                    }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Private"
                                                    size="small"
                                                    color="default"
                                                    icon={<VisibilityOffIcon />}
                                                    sx={{
                                                        background: mode === 'dark'
                                                            ? 'linear-gradient(145deg, rgba(120, 120, 120, 0.3) 0%, rgba(100, 100, 100, 0.1) 100%)'
                                                            : 'linear-gradient(145deg, rgba(158, 158, 158, 0.8) 0%, rgba(158, 158, 158, 0.4) 100%)',
                                                        backdropFilter: 'blur(20px)',
                                                        WebkitBackdropFilter: 'blur(20px)',
                                                        border: mode === 'dark'
                                                            ? '1px solid rgba(158, 158, 158, 0.5)'
                                                            : '1px solid rgba(158, 158, 158, 0.3)',
                                                        color: mode === 'dark' ? '#9e9e9e' : 'white',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        boxShadow: mode === 'dark'
                                                            ? 'inset 0 1px 0 rgba(158, 158, 158, 0.3)'
                                                            : 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Used {template.usageCount} times
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            by {template.creator.username}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => window.open(`/meme-creator?template=${template._id}`, '_blank')}
                                        >
                                            Use Template
                                        </Button>
                                        {canEditTemplate(template) && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuClick(e, template)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                sx={{ mr: 2 }}
                            >
                                Previous
                            </Button>
                            <Typography variant="body1" sx={{ mx: 2, alignSelf: 'center' }}>
                                Page {page} of {totalPages}
                            </Typography>
                            <Button
                                disabled={!hasNext}
                                onClick={() => setPage(page + 1)}
                                sx={{ ml: 2 }}
                            >
                                Next
                            </Button>
                        </Box>
                    )}
                </>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { openEditDialog(selectedTemplate); handleMenuClose(); }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Template</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { openDeleteDialog(selectedTemplate); handleMenuClose(); }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete Template</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create Template Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Template Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                label="Category"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                            }
                            label="Make template public"
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Upload Template Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                        {formData.image && (
                            <Typography variant="body2" color="text.secondary">
                                Selected: {formData.image.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTemplate}
                        variant="contained"
                        disabled={!formData.name || !formData.image}
                    >
                        Create Template
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Template Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Template</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Template Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                label="Category"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                            }
                            label="Make template public"
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Upload New Image (Optional)
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                        {formData.image && (
                            <Typography variant="body2" color="text.secondary">
                                New image: {formData.image.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateTemplate}
                        variant="contained"
                        disabled={!formData.name}
                    >
                        Update Template
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Template</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteTemplate}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default TemplateManager;
