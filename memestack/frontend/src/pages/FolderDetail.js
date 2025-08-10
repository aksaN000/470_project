import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Fab,
    Paper,
    Breadcrumbs,
    Link,
    Tooltip,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    SelectAll as SelectAllIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Folder as FolderIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { foldersAPI, memeAPI } from '../services/api';

const FolderDetail = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [folder, setFolder] = useState(null);
    const [memes, setMemes] = useState([]);
    const [allMemes, setAllMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMemes, setSelectedMemes] = useState([]);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMeme, setSelectedMeme] = useState(null);

    useEffect(() => {
        loadFolderData();
        loadAllMemes();
    }, [folderId]);

    const loadFolderData = async () => {
        try {
            setLoading(true);
            const folderData = await foldersAPI.getFolderById(folderId);
            setFolder(folderData.folder);
            setMemes(folderData.folder.memes || []);
        } catch (err) {
            setError('Failed to load folder');
            console.error('Error loading folder:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllMemes = async () => {
        try {
            const response = await memeAPI.getUserMemes();
            setAllMemes(response.data?.memes || []);
        } catch (err) {
            console.error('Error loading user memes:', err);
        }
    };

    const handleAddMemes = async () => {
        try {
            if (selectedMemes.length === 0) {
                setError('Please select at least one meme to add');
                return;
            }

            await foldersAPI.bulkAddMemesToFolder(folderId, selectedMemes);
            setSuccess(`${selectedMemes.length} meme(s) added to folder successfully`);
            setDialogOpen(false);
            setSelectedMemes([]);
            loadFolderData();
        } catch (err) {
            setError('Failed to add memes to folder');
            console.error('Error adding memes:', err);
        }
    };

    const handleRemoveMeme = async (memeId) => {
        try {
            await foldersAPI.removeMemeFromFolder(folderId, memeId);
            setSuccess('Meme removed from folder successfully');
            loadFolderData();
        } catch (err) {
            setError('Failed to remove meme from folder');
            console.error('Error removing meme:', err);
        }
    };

    const handleMemeSelect = useCallback((memeId) => {
        setSelectedMemes(prev => {
            const isSelected = prev.includes(memeId);
            if (isSelected) {
                return prev.filter(id => id !== memeId);
            } else {
                return [...prev, memeId];
            }
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        const availableMemes = allMemes.filter(meme => 
            !memes.some(folderMeme => folderMeme._id === meme._id)
        );
        
        setSelectedMemes(prev => {
            if (prev.length === availableMemes.length) {
                return [];
            } else {
                return availableMemes.map(meme => meme._id);
            }
        });
    }, [allMemes, memes]);

    const handleMenuClick = (event, meme) => {
        setAnchorEl(event.currentTarget);
        setSelectedMeme(meme);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMeme(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading folder...
                </Typography>
            </Container>
        );
    }

    if (!folder) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Folder not found
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/folders')}
                    sx={{ mt: 2 }}
                >
                    Back to Folders
                </Button>
            </Container>
        );
    }

    const availableMemes = allMemes.filter(meme => 
        !memes.some(folderMeme => folderMeme._id === meme._id)
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                            <Link 
                                component="button" 
                                variant="body1" 
                                onClick={() => navigate('/folders')}
                                sx={{ textDecoration: 'none', color: 'primary.main' }}
                            >
                                <FolderIcon sx={{ mr: 0.5, fontSize: 16 }} />
                                Folders
                            </Link>
                            <Typography color="text.primary">{folder.name}</Typography>
                        </Breadcrumbs>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    backgroundColor: folder.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    mr: 2
                                }}
                            >
                                <FolderIcon />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                    {folder.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {memes.length} memes • Created {formatDate(folder.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {folder.description && (
                            <Typography variant="body1" color="text.secondary">
                                {folder.description}
                            </Typography>
                        )}
                    </Box>
                    
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/folders')}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                            disabled={availableMemes.length === 0}
                        >
                            Add Memes
                        </Button>
                    </Box>
                </Box>
            </Paper>

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

            {/* Memes Grid */}
            {memes.length > 0 ? (
                <Grid container spacing={3}>
                    {memes.map((meme) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={meme._id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={meme.imageUrl}
                                    alt={meme.title}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/memes/${meme._id}`)}
                                />
                                <CardContent sx={{ pb: 1 }}>
                                    <Typography variant="h6" noWrap title={meme.title}>
                                        {meme.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {meme.stats?.likes || 0} likes • {meme.stats?.views || 0} views
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                                    <Box>
                                        <Chip 
                                            label={meme.category || 'General'} 
                                            size="small" 
                                            variant="outlined" 
                                        />
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuClick(e, meme)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No memes in this folder yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Add your favorite memes to organize them in this folder
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                        disabled={availableMemes.length === 0}
                    >
                        {availableMemes.length === 0 ? 'No Memes Available' : 'Add Memes'}
                    </Button>
                </Paper>
            )}

            {/* Add Memes Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        Add Memes to {folder.name}
                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedMemes.length === availableMemes.length && availableMemes.length > 0}
                                        indeterminate={selectedMemes.length > 0 && selectedMemes.length < availableMemes.length}
                                        onChange={handleSelectAll}
                                    />
                                }
                                label="Select All"
                            />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {availableMemes.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                All your memes are already in folders
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create more memes to add them to folders
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {availableMemes.map((meme) => (
                                <Grid item xs={6} sm={4} md={3} key={meme._id}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer',
                                            border: selectedMemes.includes(meme._id) ? 2 : 1,
                                            borderColor: selectedMemes.includes(meme._id) ? 'primary.main' : 'divider',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => handleMemeSelect(meme._id)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={meme.imageUrl}
                                            alt={meme.title}
                                        />
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="caption" noWrap title={meme.title}>
                                                {meme.title}
                                            </Typography>
                                            {selectedMemes.includes(meme._id) && (
                                                <Chip 
                                                    label="Selected" 
                                                    size="small" 
                                                    color="primary" 
                                                    sx={{ mt: 0.5 }}
                                                />
                                            )}
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
                    <Button 
                        variant="contained" 
                        onClick={handleAddMemes}
                        disabled={selectedMemes.length === 0}
                    >
                        Add {selectedMemes.length} Meme{selectedMemes.length !== 1 ? 's' : ''}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Meme Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => navigate(`/memes/${selectedMeme?._id}`)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    handleRemoveMeme(selectedMeme._id);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Remove from Folder</ListItemText>
                </MenuItem>
            </Menu>
        </Container>
    );
};

export default FolderDetail;
