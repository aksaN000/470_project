// 🤝 Collaboration Card Component
// Individual collaboration card with actions

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box,
    Avatar,
    AvatarGroup,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    MoreVert,
    Delete,
    Edit,
    Visibility,
    People,
    CallSplit,
    Handshake,
    Shuffle,
    Palette
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI } from '../services/api';

const CollaborationCard = ({ collaboration, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Check if current user is the owner
    const isOwner = user && collaboration.owner && (
        collaboration.owner._id === user._id || 
        collaboration.owner._id === user.userId ||
        collaboration.owner === user._id ||
        collaboration.owner === user.userId
    );

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await collaborationsAPI.deleteCollaboration(collaboration._id);
            setDeleteDialogOpen(false);
            handleMenuClose();
            if (onDelete) {
                onDelete(collaboration._id);
            }
        } catch (error) {
            console.error('Error deleting collaboration:', error);
            alert('Failed to delete collaboration');
        } finally {
            setDeleting(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'remix': return <Shuffle />;
            case 'collaboration': return <Handshake />;
            case 'template_creation': return <Palette />;
            default: return <CallSplit />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'default';
            case 'active': return 'success';
            case 'reviewing': return 'warning';
            case 'completed': return 'info';
            default: return 'default';
        }
    };

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                    }
                }}
                onClick={() => navigate(`/collaborations/${collaboration._id}`)}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            {getTypeIcon(collaboration.type)}
                            <Typography variant="h6" component="h2" noWrap>
                                {collaboration.title}
                            </Typography>
                        </Box>
                        
                        {isOwner && (
                            <IconButton
                                size="small"
                                onClick={handleMenuOpen}
                                sx={{ ml: 1 }}
                            >
                                <MoreVert />
                            </IconButton>
                        )}
                    </Box>

                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {collaboration.description || 'No description provided'}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip 
                            label={collaboration.status} 
                            size="small" 
                            color={getStatusColor(collaboration.status)}
                        />
                        <Chip 
                            label={collaboration.type} 
                            size="small" 
                            variant="outlined"
                        />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <People fontSize="small" />
                            <Typography variant="caption">
                                {collaboration.stats?.totalContributors || 0} contributors
                            </Typography>
                        </Box>
                        
                        {collaboration.collaborators && collaboration.collaborators.length > 0 && (
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                                {collaboration.collaborators.slice(0, 3).map((collaborator, index) => (
                                    <Avatar
                                        key={index}
                                        src={collaborator.user?.profile?.avatar}
                                        alt={collaborator.user?.username}
                                        sx={{ width: 24, height: 24 }}
                                    >
                                        {collaborator.user?.username?.[0]?.toUpperCase()}
                                    </Avatar>
                                ))}
                            </AvatarGroup>
                        )}
                    </Box>
                </CardContent>

                <CardActions sx={{ pt: 0 }}>
                    <Button 
                        size="small" 
                        startIcon={<Visibility />}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/collaborations/${collaboration._id}`);
                        }}
                    >
                        View
                    </Button>
                    
                    {user && !isOwner && (
                        <Button 
                            size="small" 
                            startIcon={<People />}
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Handle join collaboration
                                navigate(`/collaborations/${collaboration._id}`);
                            }}
                        >
                            Join
                        </Button>
                    )}
                </CardActions>
            </Card>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
            >
                <MenuItem onClick={() => {
                    navigate(`/collaborations/${collaboration._id}/edit`);
                    handleMenuClose();
                }}>
                    <Edit sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        setDeleteDialogOpen(true);
                        handleMenuClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle>Delete Collaboration</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{collaboration.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete}
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CollaborationCard;
