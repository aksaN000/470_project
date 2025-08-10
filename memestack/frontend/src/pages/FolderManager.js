import React, { useState, useEffect } from 'react';
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
    Divider,
    Tooltip,
    Paper,
    Fade,
    Zoom,
    useTheme,
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
    Label as TagIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { foldersAPI } from '../services/api';

const FolderManager = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode() || { mode: 'light' };
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6366f1',
        icon: 'folder',
        isPrivate: true
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFolderForMenu, setSelectedFolderForMenu] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const iconOptions = [
        { value: 'folder', label: 'Folder', icon: <FolderIcon /> },
        { value: 'star', label: 'Star', icon: <StarIcon /> },
        { value: 'bookmark', label: 'Bookmark', icon: <BookmarkIcon /> },
        { value: 'image', label: 'Image', icon: <ImageIcon /> },
        { value: 'work', label: 'Work', icon: <WorkIcon /> },
        { value: 'school', label: 'School', icon: <SchoolIcon /> },
        { value: 'home', label: 'Home', icon: <HomeIcon /> },
        { value: 'sports', label: 'Sports', icon: <SportsIcon /> },
        { value: 'music', label: 'Music', icon: <MusicIcon /> },
        { value: 'trending_up', label: 'Trending', icon: <TrendingUpIcon /> },
        { value: 'favorite', label: 'Favorite', icon: <FavoriteIcon /> },
        { value: 'public', label: 'Public', icon: <PublicIcon /> },
        { value: 'tag', label: 'Tag', icon: <TagIcon /> }
    ];

    const colorOptions = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b',
        '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16',
        '#f97316', '#6b7280', '#1f2937', '#7c3aed'
    ];

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            if (!user) {
                setError('Please log in to view your folders');
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(''); // Clear any previous errors
            const response = await foldersAPI.getFolders();
            console.log('Folders loaded:', response);
            setFolders(response.folders || []);
        } catch (err) {
            console.error('Failed to load folders:', err);
            if (err.response?.status === 401) {
                setError('Please log in to view your folders');
            } else {
                setError('Failed to load folders');
            }
        } finally {
            setLoading(false);
        }
    };

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
            setError(''); // Clear any previous errors
            
            // Check if user is authenticated
            if (!user) {
                setError('You must be logged in to create folders');
                return;
            }
            
            // Validate form data
            if (!formData.name || !formData.name.trim()) {
                setError('Folder name is required');
                return;
            }
            
            if (formData.name.length > 50) {
                setError('Folder name must be 50 characters or less');
                return;
            }
            
            console.log('🟦 Submitting folder with data:', formData);
            console.log('🟦 User authenticated:', user);
            console.log('🟦 User ID:', user?.id || user?._id);
            
            if (selectedFolder) {
                console.log('🟦 Updating existing folder');
                await foldersAPI.updateFolder(selectedFolder._id, formData);
                setSuccess('Folder updated successfully');
            } else {
                console.log('🟦 Creating new folder');
                const result = await foldersAPI.createFolder(formData);
                console.log('🟩 Folder creation result:', result);
                setSuccess('Folder created successfully');
            }
            setDialogOpen(false);
            loadFolders();
        } catch (err) {
            console.error('🟥 Folder submission error:', err);
            console.error('🟥 Error response:', err.response);
            console.error('🟥 Error data:', err.response?.data);
            
            // Handle different types of errors
            if (err.message) {
                setError(err.message);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to perform this action.');
            } else if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to save folder. Please try again.');
            }
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (window.confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
            try {
                await foldersAPI.deleteFolder(folderId);
                setSuccess('Folder deleted successfully');
                loadFolders();
            } catch (err) {
                setError('Failed to delete folder');
            }
        }
        handleMenuClose();
    };

    const handleShareFolder = async (folderId) => {
        try {
            const response = await foldersAPI.generateShareLink(folderId);
            const shareUrl = `${window.location.origin}${response.shareUrl}`;
            
            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            setSuccess('Share link copied to clipboard');
        } catch (err) {
            setError('Failed to generate share link');
        }
        handleMenuClose();
    };

    const handleMenuClick = (event, folder) => {
        setAnchorEl(event.currentTarget);
        setSelectedFolderForMenu(folder);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFolderForMenu(null);
    };

    const getIconComponent = (iconName) => {
        const iconOption = iconOptions.find(opt => opt.value === iconName);
        return iconOption ? iconOption.icon : <FolderIcon />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                                    background: mode === 'dark'
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                    backdropFilter: 'blur(50px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.15)'
                                        : '2px solid rgba(99, 102, 241, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.25)'
                                        : '3px solid rgba(99, 102, 241, 0.25)',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: mode === 'dark'
                                        ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                        : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
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
                                            {/* Folder Emoji - Separate for Natural Colors */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(-2deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                📁
                                            </Box>
                                            
                                            {/* Folder Manager Text with Gradient */}
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
                                                Folder Manager
                                            </Box>
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Organize your memes into custom folders and collections
                                        </Typography>
                                    </Box>
                                    
                                    {/* Absolutely positioned button */}
                                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleCreateFolder}
                                            size="large"
                                            sx={{
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
                                                color: 'white',
                                                borderRadius: '16px',
                                                px: 3,
                                                py: 1.5,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b21b6'} 0%, ${currentThemeColors?.secondary || '#7c3aed'} 100%)`,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                            }}
                                        >
                                            Create Folder
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                backdropFilter: 'blur(50px)',
                                border: mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.15)'
                                    : '2px solid rgba(99, 102, 241, 0.15)',
                                borderTop: mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.25)'
                                    : '3px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: '20px',
                                boxShadow: mode === 'dark'
                                    ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                                p: 4,
                            }}
                        >
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

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {folders.map((folder) => (
                        <Grid item xs={12} sm={6} md={4} key={folder._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                                onClick={() => navigate(`/folders/${folder._id}`)}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 1,
                                                backgroundColor: folder.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                mr: 2
                                            }}
                                        >
                                            {getIconComponent(folder.icon)}
                                        </Box>
                                        <Box flex={1}>
                                            <Typography variant="h6" noWrap>
                                                {folder.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {folder.memeCount} memes
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuClick(e, folder);
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

                                    <Box display="flex" gap={1} mb={2}>
                                        <Chip
                                            label={folder.isPrivate ? 'Private' : 'Public'}
                                            size="small"
                                            color={folder.isPrivate ? 'default' : 'primary'}
                                        />
                                        {folder.sharing?.isPublic && (
                                            <Chip
                                                label="Shared"
                                                size="small"
                                                color="secondary"
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="caption" color="text.secondary">
                                        Created {formatDate(folder.createdAt)}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        startIcon={<FolderIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/folders/${folder._id}`);
                                        }}
                                        sx={{ flex: 1 }}
                                    >
                                        Manage Memes
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}

                    {folders.length === 0 && (
                        <Grid item xs={12}>
                            <Box textAlign="center" py={8}>
                                <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    No folders yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Create your first folder to organize your memes
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateFolder}
                                >
                                    Create Your First Folder
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleEditFolder(selectedFolderForMenu)}>
                    <ListItemIcon>
                        <EditIcon />
                    </ListItemIcon>
                    <ListItemText>Edit Folder</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShareFolder(selectedFolderForMenu?._id)}>
                    <ListItemIcon>
                        <ShareIcon />
                    </ListItemIcon>
                    <ListItemText>Share Folder</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem 
                    onClick={() => handleDeleteFolder(selectedFolderForMenu?._id)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete Folder</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create/Edit Folder Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedFolder ? 'Edit Folder' : 'Create New Folder'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Folder Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Icon</InputLabel>
                        <Select
                            value={formData.icon}
                            label="Icon"
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        >
                            {iconOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box display="flex" alignItems="center">
                                        {option.icon}
                                        <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                            Color
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {colorOptions.map((color) => (
                                <Box
                                    key={color}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: color,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                                    }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </Box>
                    </Box>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Privacy</InputLabel>
                        <Select
                            value={formData.isPrivate}
                            label="Privacy"
                            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.value })}
                        >
                            <MenuItem value={true}>Private</MenuItem>
                            <MenuItem value={false}>Public</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name.trim()}
                    >
                        {selectedFolder ? 'Update' : 'Create'}
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

export default FolderManager;
