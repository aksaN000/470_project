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
    LinearProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Add as AddIcon,
    Comment as CommentIcon,
    Share as ShareIcon,
    CallSplit as ForkIcon,
    People as InviteIcon,
    PlayArrow as PlayIcon,
    Visibility as ViewIcon,
    ThumbUp as LikeIcon,
    History as HistoryIcon,
    Group as GroupIcon,
    EmojiEvents as ChallengeIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI } from '../services/api';

const CollaborationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        loadCollaboration();
    }, [id]);

    const loadCollaboration = async () => {
        try {
            setLoading(true);
            const data = await collaborationsAPI.getCollaborationById(id);
            setCollaboration(data);
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
            setSuccess('Collaboration forked successfully!');
            setForkDialogOpen(false);
            setForkTitle('');
            navigate(`/collaborations/${forkedCollab._id}`);
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
        } catch (error) {
            setError(error.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
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
                            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                                {collaboration.title}
                            </Typography>
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
                                        onClick={() => navigate(`/meme-editor?collaboration=${id}`)}
                                    >
                                        Contribute
                                    </Button>
                                    
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
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            {/* Overview Tab */}
                            {activeTab === 0 && (
                                <Grid container spacing={3}>
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
                                                        <Typography variant="caption" color="text.secondary">
                                                            Score: {collab.contributionScore || 0}
                                                        </Typography>
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
                        </Box>
                    </Paper>

                    {/* Dialogs */}
                    
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
                    <Dialog open={forkDialogOpen} onClose={() => setForkDialogOpen(false)}>
                        <DialogTitle>Fork Collaboration</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Fork Title"
                                value={forkTitle}
                                onChange={(e) => setForkTitle(e.target.value)}
                                margin="normal"
                                placeholder={`Fork of ${collaboration.title}`}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setForkDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleFork}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={20} /> : 'Fork'}
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
