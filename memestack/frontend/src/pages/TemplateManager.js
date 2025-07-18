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
    Fab
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
import { templatesAPI } from '../services/api';

const TemplateManager = () => {
    const { user } = useAuth();
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Meme Templates
                </Typography>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <AddIcon />
                </Fab>
            </Box>

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
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={template.imageUrl}
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
                                            />
                                            {template.isPublic ? (
                                                <Chip
                                                    label="Public"
                                                    size="small"
                                                    color="success"
                                                    icon={<VisibilityIcon />}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Private"
                                                    size="small"
                                                    color="default"
                                                    icon={<VisibilityOffIcon />}
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
        </Container>
    );
};

export default TemplateManager;
