// 🔍 Meme Detail Page Component
// View individual meme with details and interactions

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Chip,
    IconButton,
    Grid,
    Avatar,
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
    Snackbar
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Report as ReportIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { memeAPI } from '../services/api';
import { submitReport } from '../services/moderationAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FollowButton from '../components/common/FollowButton';
import CommentSection from '../components/comments/CommentSection';

const MemeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [meme, setMeme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liked, setLiked] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const reportReasons = [
        'Inappropriate content',
        'Spam',
        'Harassment',
        'Copyright violation',
        'Hate speech',
        'Violence',
        'Misleading information',
        'Other'
    ];

    useEffect(() => {
        fetchMeme();
    }, [id]);

    const fetchMeme = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Try to fetch real meme data from API
            try {
                const response = await memeAPI.getMemeById(id);
                if (response.success && response.data) {
                    // Handle both direct meme data and nested meme data
                    const memeData = response.data.meme || response.data;
                    setMeme(memeData);
                    setLiked(memeData.isLiked || false);
                    return;
                }
            } catch (apiError) {
                console.error('Failed to fetch meme:', apiError);
                setError('Failed to load meme');
            }
        } catch (error) {
            console.error('Error fetching meme:', error);
            setError('Failed to load meme');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please log in to like memes', severity: 'warning' });
            return;
        }

        try {
            const response = await memeAPI.toggleLike(id);
            if (response.success) {
                setLiked(response.data.isLiked);
                setMeme(prev => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        likesCount: response.data.likesCount
                    }
                }));
                setSnackbar({ open: true, message: response.data.isLiked ? 'Liked!' : 'Unliked!', severity: 'success' });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setSnackbar({ open: true, message: 'Failed to toggle like', severity: 'error' });
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(meme.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${meme.title || 'meme'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading meme:', error);
            setSnackbar({ open: true, message: 'Failed to download meme', severity: 'error' });
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: meme.title,
                    text: meme.description,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleReport = async () => {
        if (!isAuthenticated) {
            setSnackbar({ open: true, message: 'Please login to report content', severity: 'warning' });
            return;
        }

        try {
            await submitReport({
                contentType: 'meme',
                contentId: id,
                reason: reportReason,
                description: reportDescription
            });
            setReportDialogOpen(false);
            setReportReason('');
            setReportDescription('');
            setSnackbar({ open: true, message: 'Report submitted successfully', severity: 'success' });
        } catch (error) {
            console.error('Error submitting report:', error);
            setSnackbar({ open: true, message: 'Failed to submit report', severity: 'error' });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !meme) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Meme not found'}
                </Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate(-1)}
                    variant="outlined"
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Back Button */}
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back to Gallery
            </Button>

            <Grid container spacing={3}>
                {/* Meme Image and Details */}
                <Grid item xs={12}>
                    <Card>
                        <CardMedia
                            component="img"
                            image={meme.imageUrl}
                            alt={meme.title}
                            sx={{ height: 'auto', maxHeight: 600, objectFit: 'contain' }}
                        />
                        <CardContent>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {meme.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {meme.description}
                            </Typography>
                            
                            {/* Creator Info */}
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Avatar 
                                    src={meme.creator?.avatar} 
                                    alt={meme.creator?.username}
                                >
                                    {meme.creator?.username?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {meme.creator?.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(meme.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                {isAuthenticated && user?.id !== meme.creator?.id && (
                                    <FollowButton userId={meme.creator?.id} />
                                )}
                            </Box>

                            {/* Category and Tags */}
                            <Box mb={2}>
                                <Chip 
                                    label={meme.category} 
                                    color="primary" 
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                                {meme.tags?.map((tag, index) => (
                                    <Chip 
                                        key={index}
                                        label={tag} 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                            </Box>

                            {/* Stats */}
                            <Box display="flex" gap={3} mb={2}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <FavoriteIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{meme.stats?.likesCount || 0} likes</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <ViewIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{meme.stats?.viewsCount || 0} views</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                        
                        <CardActions>
                            <IconButton 
                                onClick={handleLike}
                                color={liked ? "error" : "default"}
                                disabled={!isAuthenticated}
                            >
                                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <IconButton onClick={handleShare}>
                                <ShareIcon />
                            </IconButton>
                            <IconButton onClick={handleDownload}>
                                <DownloadIcon />
                            </IconButton>
                            {isAuthenticated && user?.id !== meme.creator?.id && (
                                <IconButton 
                                    onClick={() => setReportDialogOpen(true)}
                                    color="warning"
                                >
                                    <ReportIcon />
                                </IconButton>
                            )}
                        </CardActions>
                    </Card>
                </Grid>

                {/* Comments Section */}
                <Grid item xs={12}>
                    <CommentSection memeId={id} />
                </Grid>
            </Grid>

            {/* Report Dialog */}
            <Dialog 
                open={reportDialogOpen} 
                onClose={() => setReportDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Report This Meme</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Reason for Report</InputLabel>
                        <Select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            label="Reason for Report"
                        >
                            {reportReasons.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                    {reason}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Additional Details (Optional)"
                        multiline
                        rows={4}
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Please provide additional details about why you're reporting this content..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleReport}
                        disabled={!reportReason}
                        color="warning"
                    >
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MemeDetail;