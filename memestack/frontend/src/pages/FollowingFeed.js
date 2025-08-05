// 📰 Following Feed Page Component
// View memes from followed users

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Pagination,
    Alert,
    Button,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { followAPI, memeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FollowButton from '../components/common/FollowButton';

const FollowingFeed = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
    });
    const [page, setPage] = useState(1);

    // Fetch following feed
    const fetchFollowingFeed = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await followAPI.getFollowingFeed({
                page: pageNum,
                limit: 12
            });
            
            setMemes(response.data.memes);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching following feed:', error);
            setError(error.message || 'Failed to load feed');
            setMemes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFollowingFeed(page);
        }
    }, [user, page]);

    // Handle pagination
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        fetchFollowingFeed(newPage);
    };

    // Handle download
    const handleDownload = async (meme, event) => {
        event.stopPropagation();
        
        try {
            const response = await memeAPI.downloadMeme(meme._id);
            
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let filename = `meme-${meme._id}-${meme.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download meme. Please try again.');
        }
    };

    // Handle like toggle
    const handleLike = async (memeId, event) => {
        event.stopPropagation();
        
        try {
            await memeAPI.toggleLike(memeId);
            // Update local state
            setMemes(prevMemes => 
                prevMemes.map(meme => 
                    meme._id === memeId 
                        ? {
                            ...meme,
                            isLiked: !meme.isLiked,
                            stats: {
                                ...meme.stats,
                                likesCount: meme.isLiked 
                                    ? meme.stats.likesCount - 1 
                                    : meme.stats.likesCount + 1
                            }
                        }
                        : meme
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">
                    Please log in to view your following feed.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    📰 Following Feed
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    See the latest memes from creators you follow
                </Typography>
            </Box>

            {loading ? (
                <LoadingSpinner message="Loading your feed..." />
            ) : error ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={() => fetchFollowingFeed(page)}
                    >
                        Try Again
                    </Button>
                </Box>
            ) : memes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PersonAddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Your feed is empty
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Follow some creators to see their latest memes here!
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/gallery')}
                        startIcon={<PersonAddIcon />}
                    >
                        Browse Gallery
                    </Button>
                </Box>
            ) : (
                <>
                    {/* Memes Grid */}
                    <Grid container spacing={3}>
                        {memes.map((meme) => (
                            <Grid item xs={12} sm={6} md={4} key={meme._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    onClick={() => navigate(`/meme/${meme._id}`)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={meme.imageUrl}
                                        alt={meme.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography 
                                            variant="h6" 
                                            component="h3" 
                                            gutterBottom
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {meme.title}
                                        </Typography>
                                        
                                        {/* Creator Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                by {meme.creator?.username || 'Unknown'}
                                            </Typography>
                                            <Box sx={{ ml: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                                <FollowButton 
                                                    userId={meme.creator?._id} 
                                                    username={meme.creator?.username}
                                                    variant="chip"
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <Chip 
                                                label={meme.category} 
                                                size="small" 
                                                color="primary" 
                                            />
                                            <Chip 
                                                label={`❤️ ${meme.stats?.likesCount || 0}`} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                        </Box>
                                        
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {meme.description || 'No description available'}
                                        </Typography>
                                    </CardContent>
                                    
                                    <CardActions sx={{ justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                color={meme.isLiked ? 'error' : 'default'}
                                                onClick={(e) => handleLike(meme._id, e)}
                                                title="Like meme"
                                            >
                                                {meme.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleDownload(meme, e)}
                                                title="Download meme"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(meme.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default FollowingFeed;
