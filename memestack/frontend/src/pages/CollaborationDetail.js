// 🤝 Collaboration Detail Page
// Displays detailed view of a collaboration with all functionality

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    Box,
    Tab,
    Tabs,
    Avatar,
    AvatarGroup,
    Paper,
    Fade,
    Zoom,
    useTheme,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    LinearProgress,
    Autocomplete
} from '@mui/material';
import {
    Edit as EditIcon,
    Add as AddIcon,
    Comment as CommentIcon,
    Share as ShareIcon,
    CallSplit as ForkIcon,
    People as InviteIcon,
    People,
    PlayArrow as PlayIcon,
    Visibility as ViewIcon,
    ThumbUp as LikeIcon,
    History as HistoryIcon,
    Group as GroupIcon,
    EmojiEvents as ChallengeIcon,
    ArrowBack as BackIcon,
    Analytics as AnalyticsIcon,
    Settings as AdvancedIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI, memeAPI } from '../services/api';
import useNotifications from '../hooks/useNotifications';
import NotificationPanel from '../components/NotificationPanel';
import AdvancedCollaborationFeatures from '../components/AdvancedCollaborationFeatures';

const CollaborationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    
    const [collaboration, setCollaboration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Dialog states
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [forkDialogOpen, setForkDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    
    // Form states
    const [joinMessage, setJoinMessage] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteRole, setInviteRole] = useState('contributor');
    const [inviteMessage, setInviteMessage] = useState('');
    const [forkTitle, setForkTitle] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Version creation states
    const [versionDialogOpen, setVersionDialogOpen] = useState(false);
    const [versionTitle, setVersionTitle] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    const [selectedMeme, setSelectedMeme] = useState(null);
    const [userMemes, setUserMemes] = useState([]);
    
    // Activity states
    const [lastActivity, setLastActivity] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null);
    
    // Notifications
    const {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
    } = useNotifications(id);

    useEffect(() => {
        loadCollaboration();
        loadUserMemes();
        
        // Show welcome message for forked collaborations
        if (location.state?.forked) {
            setSuccess(location.state.message || 'Fork created successfully!');
            // Clear the state to prevent showing again on refresh
            navigate(location.pathname, { replace: true });
        }
        
        // Set up auto-refresh for live updates
        const interval = setInterval(() => {
            loadCollaboration();
        }, 30000); // Refresh every 30 seconds
        
        setRefreshInterval(interval);
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [id, location.state]);

    const loadUserMemes = async () => {
        try {
            const response = await memeAPI.getMyMemes();
            // Fix: Access the correct nested structure
            setUserMemes(response.data?.memes || response.memes || []);
        } catch (error) {
            console.error('Failed to load user memes:', error);
        }
    };

    const loadCollaboration = async () => {
        try {
            setLoading(true);
            const data = await collaborationsAPI.getCollaborationById(id);
            setCollaboration(data);
            
            // Track activity updates
            if (data.updatedAt !== lastActivity) {
                setLastActivity(data.updatedAt);
            }
        } catch (error) {
            setError(error.message || 'Failed to load collaboration');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setSubmitting(true);
            await collaborationsAPI.joinCollaboration(id, joinMessage);
            setSuccess('Successfully joined collaboration!');
            setJoinDialogOpen(false);
            setJoinMessage('');
            loadCollaboration();
            
            // Add notification
            addNotification({
                type: 'user_joined',
                title: 'Joined Collaboration',
                message: 'You successfully joined this collaboration'
            });
        } catch (error) {
            setError(error.message || 'Failed to join collaboration');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInvite = async () => {
        try {
            setSubmitting(true);
            await collaborationsAPI.inviteUser(id, inviteUsername, inviteRole, inviteMessage);
            setSuccess('Invitation sent successfully!');
            setInviteDialogOpen(false);
            setInviteUsername('');
            setInviteMessage('');
            loadCollaboration();
            
            // Add notification
            addNotification({
                type: 'invitation_sent',
                title: 'Invitation Sent',
                message: `Invited ${inviteUsername} as ${inviteRole}`
            });
        } catch (error) {
            setError(error.message || 'Failed to send invitation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFork = async () => {
        try {
            setSubmitting(true);
            const forkedCollab = await collaborationsAPI.forkCollaboration(id, forkTitle);
            setSuccess('Collaboration forked successfully! You are now the owner of this new collaboration.');
            setForkDialogOpen(false);
            setForkTitle('');
            
            // Navigate to the new forked collaboration with a success message
            navigate(`/collaborations/${forkedCollab._id}`, { 
                state: { 
                    forked: true, 
                    originalTitle: collaboration.title,
                    message: 'Fork created successfully! You can now start enhancing this collaboration and invite others to join.'
                }
            });
        } catch (error) {
            setError(error.message || 'Failed to fork collaboration');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComment = async () => {
        try {
            setSubmitting(true);
            await collaborationsAPI.addComment(id, { content: commentContent });
            setSuccess('Comment added successfully!');
            setCommentDialogOpen(false);
            setCommentContent('');
            loadCollaboration();
            
            // Note: Don't add notification for own comment - only other users should be notified
            // The notification for other collaborators would be handled by the backend/real-time system
        } catch (error) {
            setError(error.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateVersion = async () => {
        try {
            setSubmitting(true);
            const versionData = {
                title: versionTitle,
                description: versionDescription,
                meme: selectedMeme
            };
            await collaborationsAPI.createVersion(id, versionData);
            setSuccess('New version created successfully!');
            setVersionDialogOpen(false);
            setVersionTitle('');
            setVersionDescription('');
            setSelectedMeme(null);
            loadCollaboration();
            
            // Note: Don't add notification for own version creation - only other collaborators should be notified
            // The notification for other collaborators would be handled by the backend/real-time system
        } catch (error) {
            setError(error.message || 'Failed to create version');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId) => {
        if (!window.confirm('Are you sure you want to remove this collaborator?')) {
            return;
        }
        
        try {
            await collaborationsAPI.removeCollaborator(id, collaboratorId);
            setSuccess('Collaborator removed successfully!');
            loadCollaboration();
        } catch (error) {
            setError(error.message || 'Failed to remove collaborator');
        }
    };

    const handleChangeRole = async (collaboratorId, currentRole) => {
        const roles = ['contributor', 'editor', 'reviewer', 'admin'];
        const currentIndex = roles.indexOf(currentRole);
        const newRole = roles[(currentIndex + 1) % roles.length];
        
        try {
            await collaborationsAPI.updateCollaboratorRole(id, collaboratorId, newRole);
            setSuccess(`Collaborator role updated to ${newRole}!`);
            loadCollaboration();
        } catch (error) {
            setError(error.message || 'Failed to update collaborator role');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'reviewing': return 'warning';
            case 'completed': return 'info';
            case 'draft': return 'default';
            default: return 'default';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'owner': return 'error';
            case 'admin': return 'warning';
            case 'editor': return 'info';
            case 'reviewer': return 'secondary';
            case 'contributor': return 'primary';
            default: return 'default';
        }
    };

    // Helper functions for permissions
    const canEditCollaboration = () => {
        if (!collaboration || !user) return false;
        
        // Owner can always edit
        if (collaboration.owner._id === user._id) return true;
        
        // Check if user is an admin collaborator
        return collaboration.collaborators?.some(collab => 
            collab.user._id === user._id && ['admin'].includes(collab.role)
        );
    };

    const canCreateVersion = () => {
        if (!collaboration || !user) return false;
        
        // Owner can always create versions
        if (collaboration.owner._id === user._id) return true;
        
        // Check if user is a collaborator with proper role
        return collaboration.collaborators?.some(collab => 
            collab.user._id === user._id && ['admin', 'editor', 'contributor'].includes(collab.role)
        );
    };

    const canInviteUsers = () => {
        if (!collaboration || !user) return false;
        
        // Owner can always invite
        if (collaboration.owner._id === user._id) return true;
        
        // Check if user is an admin collaborator
        return collaboration.collaborators?.some(collab => 
            collab.user._id === user._id && ['admin'].includes(collab.role)
        );
    };

    const isCollaborator = () => {
        if (!collaboration || !user) return false;
        
        // Owner is always a collaborator
        if (collaboration.owner._id === user._id) return true;
        
        // Check if user is in collaborators list
        return collaboration.collaborators?.some(collab => collab.user._id === user._id);
    };

    const getCollaboratorRole = () => {
        if (!collaboration || !user) return null;
        
        // Check if user is the owner
        if (collaboration.owner._id === user._id) return 'owner';
        
        // Find user in collaborators list
        const collaborator = collaboration.collaborators?.find(collab => collab.user._id === user._id);
        return collaborator?.role || null;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!collaboration) {
        return (
            <Container>
                <Alert severity="error">
                    Collaboration not found or you don't have permission to view it.
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4
        }}>
            <Fade in timeout={800}>
                <Container maxWidth="xl">
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

                    {/* Special Welcome for Fork Owners */}
                    {collaboration?.parentCollaboration && collaboration?.owner?._id === user?._id && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    🎉 Welcome to your forked collaboration!
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    You're now the owner of this collaboration. Here's what you can do:
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                                    <li>Create enhanced versions by clicking "Create Enhanced Version"</li>
                                    <li>Invite collaborators to help improve the meme</li>
                                    <li>Build upon the original work and make it your own</li>
                                    <li>Share your fork with the community</li>
                                </Box>
                                <Box display="flex" gap={1} mt={2}>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        onClick={() => setVersionDialogOpen(true)}
                                        startIcon={<AddIcon />}
                                    >
                                        Create First Version
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        onClick={() => setInviteDialogOpen(true)}
                                        startIcon={<InviteIcon />}
                                    >
                                        Invite Collaborators
                                    </Button>
                                </Box>
                            </Box>
                        </Alert>
                    )}

                    {/* Header */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                            backdropFilter: 'blur(50px)',
                            borderRadius: 3,
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.15)'
                                : '2px solid rgba(99, 102, 241, 0.15)',
                            p: 3,
                            mb: 3
                        }}
                    >
                        <Box display="flex" alignItems="center" mb={2}>
                            <IconButton onClick={() => navigate('/collaborations')} sx={{ mr: 2 }}>
                                <BackIcon />
                            </IconButton>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" component="h1">
                                    {collaboration.title}
                                </Typography>
                                {/* Live Activity Indicator */}
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                    <Typography variant="body2" color="text.secondary">
                                        Last activity: {new Date(collaboration.updatedAt).toLocaleString()}
                                    </Typography>
                                    {Date.now() - new Date(collaboration.updatedAt).getTime() < 300000 && ( // Active in last 5 minutes
                                        <Chip 
                                            label="Live" 
                                            size="small" 
                                            color="success" 
                                            sx={{ 
                                                fontSize: '0.7rem',
                                                height: 20,
                                                animation: 'pulse 2s infinite',
                                                '@keyframes pulse': {
                                                    '0%': { opacity: 1 },
                                                    '50%': { opacity: 0.5 },
                                                    '100%': { opacity: 1 }
                                                }
                                            }} 
                                        />
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Notification Panel */}
                            <NotificationPanel
                                notifications={notifications}
                                unreadCount={unreadCount}
                                onMarkAsRead={markAsRead}
                                onMarkAllAsRead={markAllAsRead}
                                onClear={clearNotifications}
                            />
                            <Chip 
                                label={collaboration.status.replace('_', ' ')} 
                                color={getStatusColor(collaboration.status)}
                                sx={{ mr: 2 }}
                            />
                            <Chip 
                                label={collaboration.type.replace('_', ' ')} 
                                variant="outlined"
                            />
                        </Box>

                        {collaboration.description && (
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {collaboration.description}
                            </Typography>
                        )}

                        {/* Quick Stats */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6">{collaboration.stats?.totalContributors || 0}</Typography>
                                    <Typography variant="caption">Contributors</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6">{collaboration.stats?.totalVersions || 0}</Typography>
                                    <Typography variant="caption">Versions</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6">{collaboration.stats?.totalViews || 0}</Typography>
                                    <Typography variant="caption">Views</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box textAlign="center">
                                    <Typography variant="h6">{collaboration.stats?.totalForks || 0}</Typography>
                                    <Typography variant="caption">Forks</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Actions */}
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {user && !collaboration.isCollaborator && collaboration.status === 'active' && (
                                <Button
                                    variant="contained"
                                    startIcon={<GroupIcon />}
                                    onClick={() => setJoinDialogOpen(true)}
                                >
                                    Join Collaboration
                                </Button>
                            )}

                            {collaboration.isCollaborator && (
                                <>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={() => setVersionDialogOpen(true)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        Create Enhanced Version
                                    </Button>
                                    
                                    {canCreateVersion() && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={() => setVersionDialogOpen(true)}
                                            sx={{ 
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    background: 'rgba(79, 70, 229, 0.1)',
                                                    borderColor: 'primary.dark',
                                                }
                                            }}
                                        >
                                            Add Version
                                        </Button>
                                    )}
                                    
                                    {['owner', 'admin', 'editor'].includes(collaboration.userRole) && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<InviteIcon />}
                                            onClick={() => setInviteDialogOpen(true)}
                                        >
                                            Invite
                                        </Button>
                                    )}
                                </>
                            )}

                            <Button
                                variant="outlined"
                                startIcon={<ForkIcon />}
                                onClick={() => setForkDialogOpen(true)}
                            >
                                Fork
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<CommentIcon />}
                                onClick={() => setCommentDialogOpen(true)}
                            >
                                Comment
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<ShareIcon />}
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setSuccess('Link copied to clipboard!');
                                }}
                            >
                                Share
                            </Button>
                        </Box>
                    </Paper>

                    {/* Content Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                            backdropFilter: 'blur(40px)',
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.1)'
                                : '2px solid rgba(99, 102, 241, 0.1)',
                            borderRadius: '16px',
                        }}
                    >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                                <Tab label="Overview" />
                                <Tab label="Versions" />
                                <Tab label="Contributors" />
                                <Tab label="Comments" />
                                <Tab 
                                    icon={<AnalyticsIcon />} 
                                    label="Advanced" 
                                    sx={{ 
                                        '& .MuiTab-iconWrapper': { 
                                            mb: 0.5 
                                        } 
                                    }} 
                                />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            {/* Overview Tab */}
                            {activeTab === 0 && (
                                <Grid container spacing={3}>
                                    {/* Progress Indicators */}
                                    <Grid item xs={12}>
                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Collaboration Progress
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} md={3}>
                                                        <Box textAlign="center">
                                                            <Typography variant="h4" color="primary">
                                                                {collaboration.versions?.length || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Versions
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box textAlign="center">
                                                            <Typography variant="h4" color="secondary">
                                                                {(collaboration.collaborators?.length || 0) + 1}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Collaborators
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box textAlign="center">
                                                            <Typography variant="h4" color="info.main">
                                                                {collaboration.comments?.length || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Comments
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box textAlign="center">
                                                            <Typography variant="h4" color="success.main">
                                                                {collaboration.stats?.totalForks || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Forks
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                {/* Progress Bar for Collaboration Status */}
                                                <Box mt={2}>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Status: {collaboration.status.charAt(0).toUpperCase() + collaboration.status.slice(1)}
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={
                                                            collaboration.status === 'draft' ? 25 :
                                                            collaboration.status === 'active' ? 75 :
                                                            collaboration.status === 'reviewing' ? 90 :
                                                            collaboration.status === 'completed' ? 100 : 50
                                                        }
                                                        sx={{ height: 8, borderRadius: 4 }}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Collaborator Capabilities Info */}
                                    {collaboration.isCollaborator && (
                                        <Grid item xs={12}>
                                            <Card sx={{ mb: 2, border: '2px solid', borderColor: 'success.main', borderRadius: 2 }}>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                        <People color="success" />
                                                        <Typography variant="h6" color="success.main">
                                                            You're a Collaborator!
                                                        </Typography>
                                                        <Chip 
                                                            label={collaboration.userRole || 'contributor'} 
                                                            size="small" 
                                                            color="success"
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        As a collaborator, here's what you can do:
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <AddIcon fontSize="small" color="success" />
                                                                <Typography variant="body2">Create new versions</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <CommentIcon fontSize="small" color="success" />
                                                                <Typography variant="body2">Add comments</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6} md={3}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <ForkIcon fontSize="small" color="success" />
                                                                <Typography variant="body2">Fork this project</Typography>
                                                            </Box>
                                                        </Grid>
                                                        {(collaboration.userRole === 'editor' || collaboration.userRole === 'admin') && (
                                                            <Grid item xs={12} sm={6} md={3}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <People fontSize="small" color="success" />
                                                                    <Typography variant="body2">Invite others</Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}

                                    <Grid item xs={12} md={8}>
                                        {/* Current Version or Original Meme */}
                                        {collaboration.currentVersion?.meme ? (
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="400"
                                                    image={collaboration.currentVersion.meme.imageUrl}
                                                    alt={collaboration.currentVersion.title}
                                                />
                                                <CardContent>
                                                    <Typography variant="h6">
                                                        {collaboration.currentVersion.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {collaboration.currentVersion.description}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ) : collaboration.originalMeme ? (
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="400"
                                                    image={collaboration.originalMeme.imageUrl}
                                                    alt={collaboration.originalMeme.title}
                                                />
                                                <CardContent>
                                                    <Typography variant="h6">
                                                        {collaboration.originalMeme.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Original meme for this collaboration
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 400,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed',
                                                    borderColor: 'grey.300',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="h6" color="text.secondary">
                                                    No content yet - Start contributing!
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        {/* Info Cards */}
                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Owner
                                                </Typography>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar 
                                                        src={collaboration.owner?.profile?.avatar}
                                                        sx={{ mr: 2 }}
                                                    >
                                                        {collaboration.owner?.username?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1">
                                                            {collaboration.owner?.profile?.displayName || collaboration.owner?.username}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            @{collaboration.owner?.username}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        {collaboration.challenge && (
                                            <Card sx={{ mb: 2 }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        <ChallengeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                        Challenge
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {collaboration.challenge.title}
                                                    </Typography>
                                                    <Chip 
                                                        size="small" 
                                                        label={collaboration.challenge.type}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        )}

                                        {collaboration.group && (
                                            <Card sx={{ mb: 2 }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                        Group
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {collaboration.group.name}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {collaboration.tags && collaboration.tags.length > 0 && (
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        Tags
                                                    </Typography>
                                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                                        {collaboration.tags.map((tag, index) => (
                                                            <Chip key={index} label={tag} size="small" />
                                                        ))}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Grid>
                                </Grid>
                            )}

                            {/* Versions Tab */}
                            {activeTab === 1 && (
                                <Box>
                                    {/* Version Creation Button */}
                                    {canCreateVersion() && (
                                        <Box mb={3}>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => setVersionDialogOpen(true)}
                                                sx={{ mb: 2 }}
                                            >
                                                Create New Version
                                            </Button>
                                        </Box>
                                    )}

                                    {collaboration.versions && collaboration.versions.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {collaboration.versions.map((version) => (
                                                <Grid item xs={12} sm={6} md={4} key={version._id}>
                                                    <Card>
                                                        {version.meme && (
                                                            <CardMedia
                                                                component="img"
                                                                height="200"
                                                                image={version.meme.imageUrl}
                                                                alt={version.title}
                                                            />
                                                        )}
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                v{version.version}: {version.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                                {version.description}
                                                            </Typography>
                                                            <Box display="flex" alignItems="center" mb={1}>
                                                                <Avatar 
                                                                    src={version.createdBy?.profile?.avatar}
                                                                    sx={{ width: 24, height: 24, mr: 1 }}
                                                                >
                                                                    {version.createdBy?.username?.[0]?.toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="caption">
                                                                    {version.createdBy?.username}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(version.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                            {version.isCurrent && (
                                                                <Chip 
                                                                    label="Current" 
                                                                    size="small" 
                                                                    color="primary"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box textAlign="center" py={4}>
                                            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No versions yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Create the first version by contributing to this collaboration
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Contributors Tab */}
                            {activeTab === 2 && (
                                <Box>
                                    {/* Pending Invites Section */}
                                    {collaboration.pendingInvites && collaboration.pendingInvites.length > 0 && (
                                        <Box mb={3}>
                                            <Typography variant="h6" gutterBottom>
                                                Pending Invites
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {collaboration.pendingInvites.map((invite) => (
                                                    <Grid item xs={12} sm={6} md={4} key={invite._id}>
                                                        <Card sx={{ border: '2px dashed', borderColor: 'warning.main' }}>
                                                            <CardContent>
                                                                <Box display="flex" alignItems="center" mb={2}>
                                                                    <Avatar 
                                                                        src={invite.user?.profile?.avatar}
                                                                        sx={{ mr: 2 }}
                                                                    >
                                                                        {invite.user?.username?.[0]?.toUpperCase()}
                                                                    </Avatar>
                                                                    <Box sx={{ flexGrow: 1 }}>
                                                                        <Typography variant="body1">
                                                                            {invite.user?.profile?.displayName || invite.user?.username}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            @{invite.user?.username}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip 
                                                                        label={`${invite.role} (pending)`} 
                                                                        color="warning" 
                                                                        size="small" 
                                                                    />
                                                                </Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Invited {new Date(invite.invitedAt).toLocaleDateString()}
                                                                </Typography>
                                                                {invite.message && (
                                                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                                        "{invite.message}"
                                                                    </Typography>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                            <Divider sx={{ my: 3 }} />
                                        </Box>
                                    )}

                                    <Typography variant="h6" gutterBottom>
                                        Team Members
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {/* Owner */}
                                        <Grid item xs={12} sm={6} md={4}>
                                            <Card>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <Avatar 
                                                            src={collaboration.owner?.profile?.avatar}
                                                            sx={{ mr: 2 }}
                                                        >
                                                            {collaboration.owner?.username?.[0]?.toUpperCase()}
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body1">
                                                                {collaboration.owner?.profile?.displayName || collaboration.owner?.username}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                @{collaboration.owner?.username}
                                                            </Typography>
                                                        </Box>
                                                        <Chip label="Owner" color="error" size="small" />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Full control over collaboration
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Collaborators */}
                                        {collaboration.collaborators?.map((collab) => (
                                            <Grid item xs={12} sm={6} md={4} key={collab.user._id}>
                                                <Card>
                                                    <CardContent>
                                                        <Box display="flex" alignItems="center" mb={2}>
                                                            <Avatar 
                                                                src={collab.user?.profile?.avatar}
                                                                sx={{ mr: 2 }}
                                                            >
                                                                {collab.user?.username?.[0]?.toUpperCase()}
                                                            </Avatar>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="body1">
                                                                    {collab.user?.profile?.displayName || collab.user?.username}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    @{collab.user?.username}
                                                                </Typography>
                                                            </Box>
                                                            <Chip 
                                                                label={collab.role} 
                                                                color={getRoleColor(collab.role)} 
                                                                size="small" 
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Joined {new Date(collab.joinedAt).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Last active {new Date(collab.lastActive).toLocaleDateString()}
                                                        </Typography>
                                                        
                                                        {/* Management Actions for Owner/Admin */}
                                                        {(collaboration.isOwner || collaboration.userRole === 'admin') && collaboration.owner?._id !== collab.user._id && (
                                                            <Box mt={2} display="flex" gap={1}>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    onClick={() => handleChangeRole(collab.user._id, collab.role)}
                                                                >
                                                                    Change Role
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    color="error"
                                                                    onClick={() => handleRemoveCollaborator(collab.user._id)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Comments Tab */}
                            {activeTab === 3 && (
                                <Box>
                                    {/* Quick Comment Button */}
                                    <Box mb={3}>
                                        <Button
                                            variant="contained"
                                            startIcon={<CommentIcon />}
                                            onClick={() => setCommentDialogOpen(true)}
                                            color="primary"
                                        >
                                            Add Comment
                                        </Button>
                                    </Box>

                                    {collaboration.comments && collaboration.comments.length > 0 ? (
                                        <Box>
                                            {collaboration.comments.map((comment) => (
                                                <Card key={comment._id} sx={{ mb: 2 }}>
                                                    <CardContent>
                                                        <Box display="flex" alignItems="center" mb={1}>
                                                            <Avatar 
                                                                src={comment.user?.profile?.avatar}
                                                                sx={{ width: 32, height: 32, mr: 2 }}
                                                            >
                                                                {comment.user?.username?.[0]?.toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="subtitle2">
                                                                {comment.user?.username}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2">
                                                            {comment.content}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box textAlign="center" py={4}>
                                            <CommentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No comments yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Be the first to share your thoughts!
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Advanced Features Tab */}
                            {activeTab === 4 && (
                                <AdvancedCollaborationFeatures 
                                    collaborationId={id}
                                    user={user}
                                    onRefresh={loadCollaboration}
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* Dialogs */}
                    
                    {/* Dialogs */}
                    
                    {/* Version Creation Dialog */}
                    <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AddIcon />
                                Create Enhanced Version
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Collaborate by enhancing the meme!</strong> Add your creative contribution to this project:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                                    <li>Upload a meme you've created or enhanced</li>
                                    <li>Describe your improvements and changes</li>
                                    <li>Build upon previous versions</li>
                                    <li>Let others see your creative process</li>
                                </Box>
                            </Alert>
                            <TextField
                                fullWidth
                                label="Version Title"
                                value={versionTitle}
                                onChange={(e) => setVersionTitle(e.target.value)}
                                margin="normal"
                                required
                                placeholder="e.g., Enhanced with new effects, Added better text styling"
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="What did you improve?"
                                value={versionDescription}
                                onChange={(e) => setVersionDescription(e.target.value)}
                                margin="normal"
                                placeholder="Describe your enhancements: new effects, better text, different style, etc."
                            />
                            <FormControl fullWidth margin="normal">
                                <Autocomplete
                                    options={userMemes}
                                    getOptionLabel={(option) => option.title || 'Untitled Meme'}
                                    value={selectedMeme}
                                    onChange={(event, newValue) => setSelectedMeme(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Your Enhanced Meme"
                                            required
                                            helperText="Choose one of your memes that represents your contribution to this collaboration"
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <img 
                                                src={option.imageUrl} 
                                                alt={option.title}
                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <Box>
                                                <Typography variant="body2">{option.title || 'Untitled'}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(option.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                />
                            </FormControl>
                            {userMemes.length === 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    You need to create some memes first! 
                                    <Button 
                                        variant="text" 
                                        size="small" 
                                        onClick={() => navigate('/create')}
                                        sx={{ ml: 1 }}
                                    >
                                        Create Meme
                                    </Button>
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setVersionDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleCreateVersion}
                                disabled={!versionTitle.trim() || !selectedMeme || submitting}
                                startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)',
                                    }
                                }}
                            >
                                {submitting ? 'Creating...' : 'Add Version'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Join Dialog */}
                    <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
                        <DialogTitle>Join Collaboration</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Message (optional)"
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                margin="normal"
                                placeholder="Why would you like to join this collaboration?"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleJoin}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={20} /> : 'Join'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Invite Dialog */}
                    <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
                        <DialogTitle>Invite User</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Username"
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                                margin="normal"
                                required
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={inviteRole}
                                    label="Role"
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <MenuItem value="contributor">Contributor</MenuItem>
                                    <MenuItem value="editor">Editor</MenuItem>
                                    <MenuItem value="reviewer">Reviewer</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Message (optional)"
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                margin="normal"
                                placeholder="Invitation message..."
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleInvite}
                                disabled={!inviteUsername || submitting}
                            >
                                {submitting ? <CircularProgress size={20} /> : 'Send Invite'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Fork Dialog */}
                    <Dialog open={forkDialogOpen} onClose={() => setForkDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            <Box display="flex" alignItems="center" gap={1}>
                                <ForkIcon />
                                Fork Collaboration
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Forking creates your own copy</strong> of this collaboration. You'll become the owner and can:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                                    <li>Invite your own collaborators</li>
                                    <li>Create enhanced versions</li>
                                    <li>Modify the project direction</li>
                                    <li>Build upon the existing work</li>
                                </Box>
                            </Alert>
                            <TextField
                                fullWidth
                                label="Fork Title"
                                value={forkTitle}
                                onChange={(e) => setForkTitle(e.target.value)}
                                margin="normal"
                                placeholder={`Fork of ${collaboration?.title || 'this collaboration'}`}
                                helperText="Leave empty to use default title"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setForkDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleFork}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={16} /> : <ForkIcon />}
                                sx={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                                    }
                                }}
                            >
                                {submitting ? 'Creating Fork...' : 'Create Fork'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Comment Dialog */}
                    <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
                        <DialogTitle>Add Comment</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Comment"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                margin="normal"
                                required
                                placeholder="Share your thoughts..."
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleComment}
                                disabled={!commentContent.trim() || submitting}
                            >
                                {submitting ? <CircularProgress size={20} /> : 'Add Comment'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Fade>
        </Box>
    );
};

export default CollaborationDetail;
