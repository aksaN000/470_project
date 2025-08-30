import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
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
    Tooltip,
    Paper,
    Fade,
    Zoom,
    useTheme,
    Skeleton,
    Snackbar,
    FormControlLabel,
    Switch,
    Autocomplete,
    InputAdornment,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    Folder as FolderIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    Star as StarIcon,
    Bookmark as BookmarkIcon,
    Image as ImageIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Sports as SportsIcon,
    MusicNote as MusicIcon,
    TrendingUp as TrendingUpIcon,
    Favorite as FavoriteIcon,
    Public as PublicIcon,
    Label as TagIcon,
    Search as SearchIcon,
    ViewModule as GridViewIcon,
    ViewList as ListViewIcon,
    Sort as SortIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { foldersAPI } from '../services/api';

const FolderManagerEnhanced = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode() || { mode: 'light' };
    
    // Core State
    const [folders, setFolders] = useState([]);
    const [filteredFolders, setFilteredFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6366f1',
        icon: 'folder',
        isPrivate: true
    });
    
    // Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFolderForMenu, setSelectedFolderForMenu] = useState(null);
    
    // UI State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'created', 'updated', 'memeCount'
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'private', 'public'
    const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Recent, 2: Favorites
    
    // Enhanced Configuration
    const iconOptions = [
        { value: 'folder', label: 'Folder', icon: <FolderIcon />, color: '#6366f1' },
        { value: 'star', label: 'Star', icon: <StarIcon />, color: '#f59e0b' },
        { value: 'bookmark', label: 'Bookmark', icon: <BookmarkIcon />, color: '#10b981' },
        { value: 'image', label: 'Image', icon: <ImageIcon />, color: '#ec4899' },
        { value: 'work', label: 'Work', icon: <WorkIcon />, color: '#6b7280' },
        { value: 'school', label: 'School', icon: <SchoolIcon />, color: '#3b82f6' },
        { value: 'home', label: 'Home', icon: <HomeIcon />, color: '#10b981' },
        { value: 'sports', label: 'Sports', icon: <SportsIcon />, color: '#f97316' },
        { value: 'music', label: 'Music', icon: <MusicIcon />, color: '#8b5cf6' },
        { value: 'trending_up', label: 'Trending', icon: <TrendingUpIcon />, color: '#06b6d4' },
        { value: 'favorite', label: 'Favorite', icon: <FavoriteIcon />, color: '#ef4444' },
        { value: 'public', label: 'Public', icon: <PublicIcon />, color: '#84cc16' },
        { value: 'tag', label: 'Tag', icon: <TagIcon />, color: '#a855f7' }
    ];

    const colorOptions = [
        { value: '#6366f1', name: 'Indigo' },
        { value: '#ec4899', name: 'Pink' },
        { value: '#10b981', name: 'Emerald' },
        { value: '#f59e0b', name: 'Amber' },
        { value: '#ef4444', name: 'Red' },
        { value: '#8b5cf6', name: 'Violet' },
        { value: '#06b6d4', name: 'Cyan' },
        { value: '#84cc16', name: 'Lime' },
        { value: '#f97316', name: 'Orange' },
        { value: '#6b7280', name: 'Gray' },
        { value: '#1f2937', name: 'Dark Gray' },
        { value: '#7c3aed', name: 'Purple' }
    ];

    // Load folders on component mount
    useEffect(() => {
        loadFolders();
    }, []);

    // Filter and sort folders when dependencies change
    useEffect(() => {
        applyFiltersAndSort();
    }, [folders, searchQuery, sortBy, sortOrder, filterBy, currentTab]);

    const loadFolders = async (showRefreshIndicator = false) => {
        try {
            if (!user) {
                setError('Please log in to view your folders');
                setLoading(false);
                return;
            }
            
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');
            
            const response = await foldersAPI.getFolders();
            console.log('📁 Folders loaded:', response);
            setFolders(response.folders || []);
            
            if (showRefreshIndicator) {
                setSuccess('Folders refreshed successfully');
            }
        } catch (err) {
            console.error('❌ Failed to load folders:', err);
            if (err.response?.status === 401) {
                setError('Please log in to view your folders');
            } else {
                setError(err.message || 'Failed to load folders');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...folders];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(folder => 
                folder.name.toLowerCase().includes(query) ||
                folder.description?.toLowerCase().includes(query)
            );
        }

        // Apply privacy filter
        if (filterBy === 'private') {
            filtered = filtered.filter(folder => folder.isPrivate);
        } else if (filterBy === 'public') {
            filtered = filtered.filter(folder => !folder.isPrivate);
        }

        // Apply tab filter
        if (currentTab === 1) { // Recent
            filtered = filtered.filter(folder => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(folder.updatedAt || folder.createdAt) > oneWeekAgo;
            });
        } else if (currentTab === 2) { // Favorites (could be based on usage, for now just folders with memes)
            filtered = filtered.filter(folder => folder.memeCount > 0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'updated':
                    aValue = new Date(a.updatedAt || a.createdAt);
                    bValue = new Date(b.updatedAt || b.createdAt);
                    break;
                case 'memeCount':
                    aValue = a.memeCount || 0;
                    bValue = b.memeCount || 0;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'desc') {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            } else {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
        });

        setFilteredFolders(filtered);
    }, [folders, searchQuery, sortBy, sortOrder, filterBy, currentTab]);

    const handleCreateFolder = () => {
        setSelectedFolder(null);
        setFormData({
            name: '',
            description: '',
            color: '#6366f1',
            icon: 'folder',
            isPrivate: true
        });
        setDialogOpen(true);
    };

    const handleEditFolder = (folder) => {
        setSelectedFolder(folder);
        setFormData({
            name: folder.name,
            description: folder.description || '',
            color: folder.color,
            icon: folder.icon,
            isPrivate: folder.isPrivate
        });
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleSubmit = async () => {
        try {
            setError('');
            
            if (!user) {
                setError('You must be logged in to create folders');
                return;
            }
            
            // Enhanced validation
            if (!formData.name || !formData.name.trim()) {
                setError('Folder name is required');
                return;
            }
            
            if (formData.name.length > 50) {
                setError('Folder name must be 50 characters or less');
                return;
            }

            if (formData.description && formData.description.length > 200) {
                setError('Description must be 200 characters or less');
                return;
            }
            
            console.log('📁 Submitting folder:', formData);
            
            if (selectedFolder) {
                await foldersAPI.updateFolder(selectedFolder._id, formData);
                setSuccess('Folder updated successfully');
            } else {
                await foldersAPI.createFolder(formData);
                setSuccess('Folder created successfully');
            }
            
            setDialogOpen(false);
            loadFolders();
        } catch (err) {
            console.error('❌ Folder submission error:', err);
            setError(err.message || 'Failed to save folder');
        }
    };

    const handleDeleteFolder = async (folder) => {
        if (!window.confirm(`Are you sure you want to delete "${folder.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await foldersAPI.deleteFolder(folder._id);
            setSuccess('Folder deleted successfully');
            loadFolders();
        } catch (err) {
            console.error('❌ Delete folder error:', err);
            setError(err.message || 'Failed to delete folder');
        }
        handleMenuClose();
    };

    const handleMenuOpen = (event, folder) => {
        setAnchorEl(event.currentTarget);
        setSelectedFolderForMenu(folder);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFolderForMenu(null);
    };

    const getIconComponent = (iconValue) => {
        const iconConfig = iconOptions.find(option => option.value === iconValue);
        return iconConfig ? iconConfig.icon : <FolderIcon />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleRefresh = () => {
        loadFolders(true);
    };

    const renderFolderCard = (folder) => (
        <Zoom in={true} key={folder._id} style={{ transitionDelay: '100ms' }}>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                    },
                    borderLeft: `4px solid ${folder.color}`,
                }}
                onClick={() => navigate(`/folders/${folder._id}`)}
            >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: folder.color,
                                color: 'white',
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {getIconComponent(folder.icon)}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {folder.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Badge badgeContent={folder.memeCount || 0} color="primary">
                                    <ImageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                </Badge>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    {folder.memeCount || 0} memes
                                </Typography>
                                {!folder.isPrivate && (
                                    <PublicIcon sx={{ fontSize: 14, color: 'success.main', ml: 1 }} />
                                )}
                            </Box>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, folder);
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                    
                    {folder.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {folder.description}
                        </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                        Updated {formatDate(folder.updatedAt || folder.createdAt)}
                    </Typography>
                </CardContent>
            </Card>
        </Zoom>
    );

    const renderFolderSkeleton = () => (
        <Card sx={{ height: 200 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="80%" height={24} />
                        <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="70%" height={16} />
            </CardContent>
        </Card>
    );

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Please log in to access your folders.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    My Folders
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh folders">
                        <IconButton onClick={handleRefresh} disabled={refreshing}>
                            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateFolder}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                        }}
                    >
                        Create Folder
                    </Button>
                </Box>
            </Box>

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <TextField
                        placeholder="Search folders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Sort */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort by</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort by"
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="created">Created</MenuItem>
                            <MenuItem value="updated">Updated</MenuItem>
                            <MenuItem value="memeCount">Meme Count</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Toggle sort order">
                        <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                            <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                        </IconButton>
                    </Tooltip>

                    {/* Filter */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Filter</InputLabel>
                        <Select
                            value={filterBy}
                            label="Filter"
                            onChange={(e) => setFilterBy(e.target.value)}
                        >
                            <MenuItem value="all">All Folders</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="public">Public</MenuItem>
                        </Select>
                    </FormControl>

                    {/* View Mode */}
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Tooltip title="Grid view">
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                color={viewMode === 'grid' ? 'primary' : 'default'}
                            >
                                <GridViewIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="List view">
                            <IconButton
                                onClick={() => setViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                            >
                                <ListViewIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{ mt: 2 }}
                >
                    <Tab label={`All (${folders.length})`} />
                    <Tab label="Recent" />
                    <Tab label="With Memes" />
                </Tabs>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Folders Grid */}
            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            {renderFolderSkeleton()}
                        </Grid>
                    ))}
                </Grid>
            ) : filteredFolders.length === 0 ? (
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        backgroundColor: (theme) => theme.palette.mode === 'light' 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(30, 41, 59, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchQuery || filterBy !== 'all' || currentTab !== 0
                            ? 'No folders match your criteria'
                            : 'No folders yet'
                        }
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {searchQuery || filterBy !== 'all' || currentTab !== 0
                            ? 'Try adjusting your search or filters'
                            : 'Create your first folder to organize your memes'
                        }
                    </Typography>
                    {(!searchQuery && filterBy === 'all' && currentTab === 0) && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateFolder}
                        >
                            Create Your First Folder
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredFolders.map((folder) => (
                        <Grid item xs={12} sm={6} md={4} key={folder._id}>
                            {renderFolderCard(folder)}
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleEditFolder(selectedFolderForMenu)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => console.log('Share folder')}>
                    <ListItemIcon>
                        <ShareIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share</ListItemText>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleDeleteFolder(selectedFolderForMenu)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedFolder ? 'Edit Folder' : 'Create New Folder'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Folder Name"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        helperText={`${formData.name.length}/50 characters`}
                        error={formData.name.length > 50}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        helperText={`${(formData.description || '').length}/200 characters`}
                        error={(formData.description || '').length > 200}
                    />
                    
                    {/* Icon Selection */}
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Icon</InputLabel>
                        <Select
                            value={formData.icon}
                            label="Icon"
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        >
                            {iconOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {option.icon}
                                        {option.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Color Selection */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Color
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {colorOptions.map((color) => (
                                <Tooltip key={color.value} title={color.name}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                            backgroundColor: color.value,
                                            cursor: 'pointer',
                                            border: formData.color === color.value ? '3px solid' : '1px solid',
                                            borderColor: formData.color === color.value ? 'primary.main' : 'divider',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isPrivate}
                                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                            />
                        }
                        label="Private Folder"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!formData.name.trim() || formData.name.length > 50}
                    >
                        {selectedFolder ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={Boolean(success)}
                autoHideDuration={3000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default FolderManagerEnhanced;
