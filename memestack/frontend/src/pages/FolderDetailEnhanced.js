import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Breadcrumbs,
    Link,
    Tooltip,
    Checkbox,
    Skeleton,
    Snackbar,
    InputAdornment,
    Badge,
    AppBar,
    Toolbar,
    useTheme,
    alpha,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Favorite as FavoriteIcon,
    Edit as EditIcon,
    SelectAll as SelectAllIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Folder as FolderIcon,
    Search as SearchIcon,
    ViewModule as GridViewIcon,
    ViewList as ListViewIcon,
    CloudUpload as CloudUploadIcon,
    PhotoLibrary as PhotoLibraryIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { foldersAPI, memeAPI } from '../services/api';

const FolderDetailEnhanced = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();

    // Core State
    const [folder, setFolder] = useState(null);
    const [memes, setMemes] = useState([]);
    const [filteredMemes, setFilteredMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Selection State
    const [selectedMemes, setSelectedMemes] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(''); // 'add', 'settings'

    // Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMeme, setSelectedMeme] = useState(null);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');

    // Available memes for adding to folder
    const [availableMemes, setAvailableMemes] = useState([]);
    const [loadingAvailableMemes, setLoadingAvailableMemes] = useState(false);

    const loadFolder = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await foldersAPI.getFolderById(folderId);
            console.log('📁 Folder loaded:', response);
            
            if (response.success) {
                setFolder(response.folder);
                setMemes(response.folder.memes || []);
            } else {
                setError('Failed to load folder');
            }
        } catch (err) {
            console.error('❌ Failed to load folder:', err);
            if (err.response?.status === 404) {
                setError('Folder not found');
            } else if (err.response?.status === 401) {
                setError('You do not have permission to view this folder');
            } else {
                setError(err.message || 'Failed to load folder');
            }
        } finally {
            setLoading(false);
        }
    }, [folderId]);

    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...memes];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(meme => 
                meme.title?.toLowerCase().includes(query) ||
                meme.description?.toLowerCase().includes(query) ||
                meme.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name':
                    return (a.title || '').localeCompare(b.title || '');
                case 'popular':
                    return (b.stats?.likes || 0) - (a.stats?.likes || 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        setFilteredMemes(filtered);
    }, [memes, searchQuery, sortBy]);

    useEffect(() => {
        if (folderId && user) {
            loadFolder();
        }
    }, [folderId, user, loadFolder]);

    useEffect(() => {
        applyFiltersAndSort();
    }, [memes, searchQuery, sortBy, applyFiltersAndSort]);

    const loadAvailableMemes = async () => {
        try {
            setLoadingAvailableMemes(true);
            const response = await memeAPI.getUserMemes();
            
            // Handle the response format from backend
            const userMemes = response.success ? response.data.memes : response.memes || [];
            
            // Filter out memes that are already in the folder
            const currentMemeIds = memes.map(meme => meme._id || meme.id);
            const available = userMemes.filter(meme => !currentMemeIds.includes(meme._id || meme.id));
            
            setAvailableMemes(available);
        } catch (err) {
            console.error('❌ Failed to load available memes:', err);
            setError('Failed to load available memes');
        } finally {
            setLoadingAvailableMemes(false);
        }
    };

    const handleAddMemes = async (memeIds) => {
        try {
            if (memeIds.length === 1) {
                await foldersAPI.addMemeToFolder(folderId, memeIds[0]);
                setSuccess('Meme added to folder successfully');
            } else {
                await foldersAPI.bulkAddMemesToFolder(folderId, memeIds);
                setSuccess(`${memeIds.length} memes added to folder successfully`);
            }
            
            setDialogOpen(false);
            loadFolder(); // Reload to get updated memes
        } catch (err) {
            console.error('❌ Failed to add memes to folder:', err);
            setError(err.message || 'Failed to add memes to folder');
        }
    };

    const handleRemoveMeme = async (memeId) => {
        try {
            await foldersAPI.removeMemeFromFolder(folderId, memeId);
            setSuccess('Meme removed from folder');
            loadFolder();
        } catch (err) {
            console.error('❌ Failed to remove meme:', err);
            setError(err.message || 'Failed to remove meme');
        }
        handleMenuClose();
    };

    const handleBulkRemove = async () => {
        if (selectedMemes.length === 0) return;
        
        if (!window.confirm(`Remove ${selectedMemes.length} memes from this folder?`)) {
            return;
        }

        try {
            // Remove memes one by one (could be optimized with a bulk endpoint)
            for (const memeId of selectedMemes) {
                await foldersAPI.removeMemeFromFolder(folderId, memeId);
            }
            
            setSuccess(`${selectedMemes.length} memes removed from folder`);
            setSelectedMemes([]);
            setSelectionMode(false);
            loadFolder();
        } catch (err) {
            console.error('❌ Failed to remove memes:', err);
            setError('Failed to remove memes');
        }
    };

    const handleSelectAll = () => {
        if (selectedMemes.length === filteredMemes.length) {
            setSelectedMemes([]);
        } else {
            setSelectedMemes(filteredMemes.map(meme => meme._id));
        }
    };

    const handleMemeSelect = (memeId) => {
        setSelectedMemes(prev => 
            prev.includes(memeId) 
                ? prev.filter(id => id !== memeId)
                : [...prev, memeId]
        );
    };

    const handleMenuOpen = (event, meme) => {
        setAnchorEl(event.currentTarget);
        setSelectedMeme(meme);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMeme(null);
    };

    const handleOpenAddDialog = () => {
        setDialogType('add');
        setDialogOpen(true);
        loadAvailableMemes();
    };

    const renderMemeCard = (meme) => (
        <Card
            key={meme._id}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                },
                ...(selectionMode && selectedMemes.includes(meme._id) && {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                }),
            }}
        >
            {selectionMode && (
                <Checkbox
                    checked={selectedMemes.includes(meme._id)}
                    onChange={() => handleMemeSelect(meme._id)}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        },
                    }}
                />
            )}
            
            <CardMedia
                component="img"
                height="200"
                image={meme.imageUrl || '/placeholder-meme.jpg'}
                alt={meme.title}
                sx={{
                    objectFit: 'cover',
                    cursor: selectionMode ? 'pointer' : 'default',
                }}
                onClick={selectionMode ? () => handleMemeSelect(meme._id) : undefined}
            />
            
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 1,
                    }}
                >
                    {meme.title || 'Untitled Meme'}
                </Typography>
                
                {meme.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 1,
                        }}
                    >
                        {meme.description}
                    </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {meme.stats?.likes || 0}
                        </Typography>
                    </Box>
                    
                    {!selectionMode && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, meme);
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    const renderMemeSkeleton = () => (
        <Card sx={{ height: 280 }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={16} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="circular" width={24} height={24} />
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="200px" height={32} />
                        <Skeleton variant="text" width="150px" height={20} />
                    </Box>
                </Box>
                
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            {renderMemeSkeleton()}
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/folders')}
                >
                    Back to Folders
                </Button>
            </Container>
        );
    }

    if (!folder) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Folder not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link
                        color="inherit"
                        href="/folders"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/folders');
                        }}
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <FolderIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        Folders
                    </Link>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 1,
                                backgroundColor: folder.color,
                                mr: 0.5,
                            }}
                        />
                        {folder.name}
                    </Typography>
                </Breadcrumbs>

                {/* Folder Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                backgroundColor: folder.color,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FolderIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{ fontWeight: 700, mb: 1 }}
                            >
                                {folder.name}
                            </Typography>
                            {folder.description && (
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                    {folder.description}
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge badgeContent={folder.memeCount || 0} color="primary">
                                    <PhotoLibraryIcon color="action" />
                                </Badge>
                                <Typography variant="body2" color="text.secondary">
                                    {folder.memeCount || 0} memes
                                </Typography>
                                {!folder.isPrivate && (
                                    <Chip 
                                        label="Public" 
                                        size="small" 
                                        color="success" 
                                        variant="outlined" 
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {selectionMode ? (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<CloseIcon />}
                                    onClick={() => {
                                        setSelectionMode(false);
                                        setSelectedMemes([]);
                                    }}
                                >
                                    Cancel
                                </Button>
                                {selectedMemes.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkRemove}
                                    >
                                        Remove ({selectedMemes.length})
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Tooltip title="Select memes">
                                    <IconButton onClick={() => setSelectionMode(true)}>
                                        <SelectAllIcon />
                                    </IconButton>
                                </Tooltip>
                                <Button
                                    variant="outlined"
                                    startIcon={<ShareIcon />}
                                    onClick={() => console.log('Share folder')}
                                >
                                    Share
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenAddDialog}
                                >
                                    Add Memes
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Controls */}
            {!selectionMode && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <TextField
                            placeholder="Search memes..."
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
                        <TextField
                            select
                            label="Sort by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="newest">Newest</MenuItem>
                            <MenuItem value="oldest">Oldest</MenuItem>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="popular">Most Liked</MenuItem>
                        </TextField>

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
                </Paper>
            )}

            {/* Selection Mode Header */}
            {selectionMode && (
                <AppBar position="static" sx={{ mb: 3, borderRadius: 1 }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {selectedMemes.length} of {filteredMemes.length} selected
                        </Typography>
                        <Button
                            color="inherit"
                            startIcon={<SelectAllIcon />}
                            onClick={handleSelectAll}
                        >
                            {selectedMemes.length === filteredMemes.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </Toolbar>
                </AppBar>
            )}

            {/* Memes Grid */}
            {filteredMemes.length === 0 ? (
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
                        {searchQuery 
                            ? 'No memes match your search'
                            : 'No memes in this folder yet'
                        }
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {searchQuery
                            ? 'Try adjusting your search query'
                            : 'Add some memes to get started'
                        }
                    </Typography>
                    {!searchQuery && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAddDialog}
                        >
                            Add Your First Memes
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredMemes.map(renderMemeCard)}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => console.log('View meme')}>
                    <ListItemIcon>
                        <ImageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => console.log('Edit meme')}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleRemoveMeme(selectedMeme?._id)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Remove from Folder</ListItemText>
                </MenuItem>
            </Menu>

            {/* Add Memes Dialog */}
            <Dialog 
                open={dialogOpen && dialogType === 'add'} 
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add Memes to Folder</DialogTitle>
                <DialogContent>
                    {loadingAvailableMemes ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : availableMemes.length === 0 ? (
                        <Alert severity="info">
                            No available memes to add. All your memes are already in this folder.
                        </Alert>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {availableMemes.map((meme) => (
                                <Grid item xs={6} sm={4} md={3} key={meme.id || meme._id}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { transform: 'scale(1.02)' },
                                        }}
                                        onClick={() => {
                                            const memeId = meme.id || meme._id;
                                            if (memeId) {
                                                handleAddMemes([memeId]);
                                            } else {
                                                setError('Invalid meme ID');
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={meme.imageUrl}
                                            alt={meme.title}
                                        />
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="caption" noWrap>
                                                {meme.title}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
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

export default FolderDetailEnhanced;
