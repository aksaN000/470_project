import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    FolderOpen as FolderOpenIcon,
    Folder as FolderIcon,
    Add as AddIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { foldersAPI } from '../../services/api';

const AddToFolderButton = ({ memeId, variant = 'icon', size = 'small' }) => {
    const [open, setOpen] = useState(false);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            loadFolders();
        }
    }, [open]);

    const loadFolders = async () => {
        try {
            setLoading(true);
            const response = await foldersAPI.getUserFolders();
            setFolders(response.folders || []);
        } catch (err) {
            setError('Failed to load folders');
            console.error('Error loading folders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToFolder = async (folderId) => {
        try {
            setAdding(folderId);
            await foldersAPI.addMemeToFolder(folderId, memeId);
            setSuccess('Meme added to folder successfully');
            
            // Close dialog after short delay to show success
            setTimeout(() => {
                setOpen(false);
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError('Failed to add meme to folder');
            console.error('Error adding meme to folder:', err);
        } finally {
            setAdding(null);
        }
    };

    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'folder':
            default:
                return <FolderIcon />;
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        setOpen(true);
        setError('');
        setSuccess('');
    };

    return (
        <>
            {variant === 'icon' ? (
                <IconButton
                    size={size}
                    onClick={handleClick}
                    title="Add to folder"
                    sx={{
                        '&:hover': {
                            background: 'rgba(99, 102, 241, 0.1)',
                        }
                    }}
                >
                    <FolderOpenIcon />
                </IconButton>
            ) : (
                <Button
                    size={size}
                    startIcon={<FolderOpenIcon />}
                    onClick={handleClick}
                    variant="outlined"
                >
                    Add to Folder
                </Button>
            )}

            <Dialog 
                open={open} 
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FolderOpenIcon />
                        Add to Folder
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : folders.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No folders found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Create a folder first to organize your memes
                            </Typography>
                            <Button 
                                variant="contained" 
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setOpen(false);
                                    window.location.href = '/folders';
                                }}
                            >
                                Create Folder
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {folders.map((folder) => (
                                <ListItem key={folder._id} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleAddToFolder(folder._id)}
                                        disabled={adding === folder._id}
                                    >
                                        <ListItemIcon>
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
                                                }}
                                            >
                                                {adding === folder._id ? (
                                                    <CircularProgress size={16} color="inherit" />
                                                ) : (
                                                    getIconComponent(folder.icon)
                                                )}
                                            </Box>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={folder.name}
                                            secondary={
                                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {folder.memeCount || 0} memes
                                                    </Typography>
                                                    <Chip
                                                        label={folder.isPrivate ? 'Private' : 'Public'}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.7rem', height: '20px' }}
                                                    />
                                                </Box>
                                            }
                                        />
                                        {adding === folder._id && (
                                            <CheckIcon color="success" />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddToFolderButton;
