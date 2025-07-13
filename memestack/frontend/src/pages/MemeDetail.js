// 🔍 Meme Detail Page Component
// View individual meme with details and interactions

import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemes } from '../contexts/MemeContext';
import { memeAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentSection from '../components/comments/CommentSection';

const MemeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentMeme, loading, setCurrentMeme, toggleLike } = useMemes();

    useEffect(() => {
        // For now, we'll simulate loading a meme
        // In a real app, you'd fetch the meme by ID
        setCurrentMeme({
            id,
            title: 'Sample Meme',
            description: 'This is a sample meme description for testing purposes.',
            imageUrl: 'https://via.placeholder.com/500x500?text=Sample+Meme',
            category: 'funny',
            creator: {
                username: 'demo_user',
                avatar: '',
            },
            stats: {
                likesCount: 42,
                views: 150,
                shares: 12,
            },
            createdAt: new Date().toISOString(),
            isLiked: false,
        });
    }, [id, setCurrentMeme]);

    const handleLike = async () => {
        if (currentMeme) {
            await toggleLike(currentMeme.id);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: currentMeme?.title,
                text: currentMeme?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await memeAPI.downloadMeme(currentMeme.id);
            
            // Create a blob from the response
            const blob = new Blob([response.data]);
            
            // Create a temporary download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from response headers or create one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `meme-${currentMeme.id}.jpg`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download meme. Please try again.');
        }
    };

    if (loading.memes || !currentMeme) {
        return <LoadingSpinner message="Loading meme..." fullScreen />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Meme Image */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardMedia
                            component="img"
                            image={currentMeme.imageUrl}
                            alt={currentMeme.title}
                            sx={{ 
                                width: '100%',
                                height: 'auto',
                                maxHeight: 600,
                                objectFit: 'contain',
                            }}
                        />
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                            <Box>
                                <IconButton
                                    color={currentMeme.isLiked ? 'error' : 'default'}
                                    onClick={handleLike}
                                >
                                    {currentMeme.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
                                <IconButton onClick={handleShare}>
                                    <ShareIcon />
                                </IconButton>
                                <IconButton onClick={handleDownload}>
                                    <DownloadIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    icon={<FavoriteIcon />} 
                                    label={currentMeme.stats.likesCount} 
                                    size="small" 
                                />
                                <Chip 
                                    icon={<ViewIcon />} 
                                    label={currentMeme.stats.views} 
                                    size="small" 
                                />
                                <Chip 
                                    icon={<ShareIcon />} 
                                    label={currentMeme.stats.shares} 
                                    size="small" 
                                />
                                <Chip 
                                    icon={<DownloadIcon />} 
                                    label={currentMeme.stats.downloads || 0} 
                                    size="small" 
                                />
                            </Box>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Meme Info */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 'fit-content' }}>
                        <CardContent>
                            <Typography variant="h5" component="h1" gutterBottom>
                                {currentMeme.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                    src={currentMeme.creator.avatar}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                >
                                    {currentMeme.creator.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" color="text.secondary">
                                    by {currentMeme.creator.username}
                                </Typography>
                            </Box>

                            <Chip 
                                label={currentMeme.category} 
                                color="primary" 
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body1" paragraph>
                                {currentMeme.description}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Created: {new Date(currentMeme.createdAt).toLocaleDateString()}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button 
                                fullWidth 
                                variant="outlined"
                                onClick={() => navigate('/gallery')}
                            >
                                Back to Gallery
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Comments Section */}
            <CommentSection memeId={id} />
        </Container>
    );
};

export default MemeDetail;
