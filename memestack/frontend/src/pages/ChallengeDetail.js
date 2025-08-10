// 🏆 Challenge Detail Component
// Displays detailed view of a specific challenge

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Chip,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tabs,
    Tab,
    LinearProgress,
    Fade,
    useTheme,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Badge,
    Tooltip
} from '@mui/material';
import {
    ArrowBack,
    Share,
    EmojiEvents,
    People,
    AccessTime,
    Visibility,
    ThumbUp,
    Send,
    Edit,
    Delete,
    Flag,
    Download,
    Favorite,
    FavoriteBorder,
    Star,
    StarBorder
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { challengesAPI, memeAPI } from '../services/api';

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [joinLoading, setJoinLoading] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [userMemes, setUserMemes] = useState([]);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [selectedMeme, setSelectedMeme] = useState(null);

    useEffect(() => {
        loadChallenge();
        if (user) {
            loadUserMemes();
        }
    }, [id, user]);

    const loadChallenge = async () => {
        try {
            setLoading(true);
            const response = await challengesAPI.getChallengeById(id);
            setChallenge(response);
            
            // Extract submissions from participants
            const allSubmissions = [];
            response.participants?.forEach(participant => {
                participant.submissions?.forEach(submission => {
                    allSubmissions.push({
                        ...submission,
                        user: participant.user,
                        participantId: participant._id
                    });
                });
            });
            setSubmissions(allSubmissions);
            
            setLoading(false);
        } catch (err) {
            setError('Failed to load challenge details');
            setLoading(false);
        }
    };

    const loadUserMemes = async () => {
        try {
            const response = await memeAPI.getUserMemes();
            setUserMemes(response.memes || []);
        } catch (err) {
            console.error('Failed to load user memes:', err);
        }
    };

    const handleJoinChallenge = async () => {
        try {
            setJoinLoading(true);
            await challengesAPI.joinChallenge(id);
            setSuccess('Successfully joined the challenge!');
            loadChallenge(); // Reload to update participant list
        } catch (err) {
            setError(err.message || 'Failed to join challenge');
        } finally {
            setJoinLoading(false);
        }
    };

    const handleSubmitMeme = async () => {
        if (!selectedMeme) return;
        
        try {
            await challengesAPI.submitMeme(id, selectedMeme._id);
            setSuccess('Meme submitted successfully!');
            setSubmitDialogOpen(false);
            setSelectedMeme(null);
            loadChallenge(); // Reload to show new submission
        } catch (err) {
            setError(err.message || 'Failed to submit meme');
        }
    };

    const handleVote = async (submissionId) => {
        try {
            await challengesAPI.voteOnSubmission(id, submissionId);
            setSuccess('Vote recorded!');
            loadChallenge(); // Reload to update vote counts
        } catch (err) {
            setError(err.message || 'Failed to vote');
        }
    };

    const formatTimeRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'voting': return 'warning';
            case 'completed': return 'default';
            case 'draft': return 'info';
            default: return 'default';
        }
    };

    const isParticipant = challenge?.participants?.some(p => p.user._id === user?._id);
    const isCreator = challenge?.creator._id === user?._id;
    const canJoin = challenge?.status === 'active' && !isParticipant && !isCreator;
    const canSubmit = challenge?.status === 'active' && isParticipant;
    const canVote = challenge?.status === 'voting' && (isParticipant || challenge?.votingSystem?.type === 'public');

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LinearProgress />
                <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    Loading challenge...
                </Typography>
            </Container>
        );
    }

    if (!challenge) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Challenge not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Fade in={true}>
                <Box>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                        <Box display="flex" alignItems="center">
                            <IconButton onClick={() => navigate('/challenges')} sx={{ mr: 2 }}>
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h4" component="h1">
                                {challenge.title}
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton>
                                <Share />
                            </IconButton>
                            {isCreator && (
                                <IconButton onClick={() => navigate(`/challenges/${id}/edit`)}>
                                    <Edit />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <Grid container spacing={4}>
                        {/* Main Content */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
                                {/* Challenge Info */}
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                                    <Box>
                                        <Chip 
                                            label={challenge.status.toUpperCase()} 
                                            color={getStatusColor(challenge.status)}
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            {challenge.description}
                                        </Typography>
                                    </Box>
                                    {challenge.template && (
                                        <Card sx={{ width: 120, height: 120, ml: 2 }}>
                                            <CardMedia
                                                component="img"
                                                height="120"
                                                image={challenge.template.imageUrl}
                                                alt={challenge.template.name}
                                            />
                                        </Card>
                                    )}
                                </Box>

                                {/* Stats */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={6} md={3}>
                                        <Box textAlign="center">
                                            <People color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h6">{challenge.stats?.participantCount || 0}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Participants
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Box textAlign="center">
                                            <Send color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h6">{challenge.stats?.totalSubmissions || 0}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Submissions
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Box textAlign="center">
                                            <Visibility sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h6">{challenge.stats?.totalViews || 0}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Views
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Box textAlign="center">
                                            <AccessTime color="warning" sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h6">{formatTimeRemaining(challenge.endDate)}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Remaining
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Action Buttons */}
                                <Box display="flex" gap={2} mb={3}>
                                    {canJoin && (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleJoinChallenge}
                                            disabled={joinLoading}
                                            startIcon={<People />}
                                        >
                                            {joinLoading ? 'Joining...' : 'Join Challenge'}
                                        </Button>
                                    )}
                                    {canSubmit && (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => setSubmitDialogOpen(true)}
                                            startIcon={<Send />}
                                        >
                                            Submit Meme
                                        </Button>
                                    )}
                                </Box>

                                {/* Rules */}
                                {challenge.rules && challenge.rules.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>Rules</Typography>
                                        <List dense>
                                            {challenge.rules.map((rule, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={`${index + 1}. ${rule}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Paper>

                            {/* Tabs for submissions, participants, etc. */}
                            <Paper elevation={1}>
                                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                    <Tab label={`Submissions (${submissions.length})`} />
                                    <Tab label={`Participants (${challenge.participants?.length || 0})`} />
                                    {challenge.prizes?.length > 0 && <Tab label="Prizes" />}
                                </Tabs>

                                <Box sx={{ p: 3 }}>
                                    {/* Submissions Tab */}
                                    {tabValue === 0 && (
                                        <Grid container spacing={3}>
                                            {submissions.map((submission) => (
                                                <Grid item xs={12} sm={6} md={4} key={submission._id}>
                                                    <Card>
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={submission.meme?.imageUrl}
                                                            alt={submission.meme?.title}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="h6" noWrap>
                                                                {submission.meme?.title}
                                                            </Typography>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                                <Box display="flex" alignItems="center">
                                                                    <Avatar 
                                                                        src={submission.user?.profile?.avatar}
                                                                        sx={{ width: 24, height: 24, mr: 1 }}
                                                                    >
                                                                        {submission.user?.username?.[0]?.toUpperCase()}
                                                                    </Avatar>
                                                                    <Typography variant="caption">
                                                                        {submission.user?.profile?.displayName || submission.user?.username}
                                                                    </Typography>
                                                                </Box>
                                                                {canVote && (
                                                                    <IconButton 
                                                                        size="small"
                                                                        onClick={() => handleVote(submission._id)}
                                                                    >
                                                                        <Badge badgeContent={submission.votes || 0} color="primary">
                                                                            <ThumbUp />
                                                                        </Badge>
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                            {submissions.length === 0 && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body1" textAlign="center" color="text.secondary">
                                                        No submissions yet. Be the first to submit!
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    )}

                                    {/* Participants Tab */}
                                    {tabValue === 1 && (
                                        <List>
                                            {challenge.participants?.map((participant) => (
                                                <ListItem key={participant._id}>
                                                    <ListItemAvatar>
                                                        <Avatar src={participant.user?.profile?.avatar}>
                                                            {participant.user?.username?.[0]?.toUpperCase()}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={participant.user?.profile?.displayName || participant.user?.username}
                                                        secondary={`${participant.submissions?.length || 0} submissions`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}

                                    {/* Prizes Tab */}
                                    {tabValue === 2 && challenge.prizes?.length > 0 && (
                                        <List>
                                            {challenge.prizes.map((prize, index) => (
                                                <ListItem key={index}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                            {prize.position}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={prize.title}
                                                        secondary={`${prize.value} - ${prize.description}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Sidebar */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Challenge Creator</Typography>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar 
                                        src={challenge.creator?.profile?.avatar}
                                        sx={{ width: 48, height: 48, mr: 2 }}
                                    >
                                        {challenge.creator?.username?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {challenge.creator?.profile?.displayName || challenge.creator?.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            @{challenge.creator?.username}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button variant="outlined" fullWidth>
                                    View Profile
                                </Button>
                            </Paper>

                            <Paper elevation={1} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Challenge Details</Typography>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="body2">{challenge.category}</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Typography variant="body2">{challenge.type}</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Max Participants</Typography>
                                    <Typography variant="body2">{challenge.maxParticipants}</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Voting System</Typography>
                                    <Typography variant="body2">{challenge.votingSystem?.type || 'Public'}</Typography>
                                </Box>
                                <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary">Created</Typography>
                                    <Typography variant="body2">
                                        {new Date(challenge.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                {challenge.tags?.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Tags</Typography>
                                        <Box mt={1}>
                                            {challenge.tags.map((tag) => (
                                                <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Submit Meme Dialog */}
                    <Dialog 
                        open={submitDialogOpen} 
                        onClose={() => setSubmitDialogOpen(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Submit Meme to Challenge</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Choose one of your memes to submit to this challenge.
                            </Typography>
                            <Grid container spacing={2}>
                                {userMemes.map((meme) => (
                                    <Grid item xs={12} sm={6} md={4} key={meme._id}>
                                        <Card 
                                            sx={{ 
                                                cursor: 'pointer',
                                                border: selectedMeme?._id === meme._id ? 2 : 0,
                                                borderColor: 'primary.main'
                                            }}
                                            onClick={() => setSelectedMeme(meme)}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={meme.imageUrl}
                                                alt={meme.title}
                                            />
                                            <CardContent>
                                                <Typography variant="caption" noWrap>
                                                    {meme.title}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            {userMemes.length === 0 && (
                                <Typography variant="body1" textAlign="center" color="text.secondary">
                                    You don't have any memes to submit. Create a meme first!
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleSubmitMeme}
                                variant="contained"
                                disabled={!selectedMeme}
                            >
                                Submit Meme
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Fade>
        </Container>
    );
};

export default ChallengeDetail;
