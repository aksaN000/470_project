// 🖼️ Meme Gallery Page Component
// Browse all public memes with filters and pagination

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
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    IconButton,
    Avatar,
    Paper,
    useTheme,
    Fade,
    Slide,
} from '@mui/material';
import { 
    Search as SearchIcon,
    Download as DownloadIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMemes } from '../contexts/MemeContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { memeAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReportButton from '../components/moderation/ReportButton';
import FollowButton from '../components/common/FollowButton';

const MemeGallery = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
    const { 
        memes, 
        pagination, 
        filters, 
        loading, 
        fetchMemes, 
        setFilters,
        toggleLike 
    } = useMemes();

    const [localFilters, setLocalFilters] = useState(filters);

    // Fetch memes on component mount (force initial load)
    useEffect(() => {
        fetchMemes(filters);
    }, []); // Empty dependency array for initial mount

    // Fetch memes on component mount and filter changes
    useEffect(() => {
        fetchMemes(filters);
    }, [filters, fetchMemes]);

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value, page: 1 };
        setLocalFilters(newFilters);
        setFilters(newFilters);
    };

    // Handle search
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            handleFilterChange('search', localFilters.search);
        }
    };

    // Handle pagination
    const handlePageChange = (event, page) => {
        const newFilters = { ...filters, page };
        setFilters(newFilters);
        fetchMemes(newFilters);
    };

    // Handle download
    const handleDownload = async (meme, event) => {
        event.stopPropagation(); // Prevent navigation to meme detail
        
        try {
            const response = await memeAPI.downloadMeme(meme.id);
            
            // Create a blob from the response
            const blob = new Blob([response.data]);
            
            // Create a temporary download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from response headers or create one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `meme-${meme.id}-${meme.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
            
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

    // Handle like toggle
    const handleLike = async (memeId, event) => {
        event.stopPropagation();
        
        try {
            await toggleLike(memeId);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const categories = [
        'all', 'funny', 'reaction', 'gaming', 'sports', 
        'political', 'wholesome', 'dark', 'trending', 'custom'
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
        }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Enhanced Header */}
                <Fade in={true} timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            textAlign: 'center',
                            background: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(99, 102, 241, 0.1)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
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
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5,
                            }}
                        >
                            {/* Framed Picture Emoji - Separate for Natural Colors */}
                            <Box
                                component="span"
                                sx={{
                                    fontSize: 'inherit',
                                    filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                    '&:hover': {
                                        transform: 'scale(1.1) rotate(-3deg)',
                                        transition: 'transform 0.3s ease',
                                    },
                                }}
                            >
                                🖼️
                            </Box>
                            
                            {/* Meme Gallery Text with Gradient */}
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
                                Meme Gallery
                            </Box>
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                            }}
                        >
                            Discover and enjoy the best memes from our community
                        </Typography>
                    </Paper>
                </Fade>

                {/* Enhanced Filters */}
                <Fade in={true} timeout={1200}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 4,
                            background: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(99, 102, 241, 0.1)',
                            borderRadius: '20px',
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search memes..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    onKeyPress={handleSearch}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={localFilters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        label="Category"
                                        sx={{
                                            borderRadius: '12px',
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                        }}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={localFilters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        label="Sort By"
                                        sx={{
                                            borderRadius: '12px',
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                        }}
                                    >
                                        <MenuItem value="createdAt">Newest</MenuItem>
                                        <MenuItem value="stats.likesCount">Most Liked</MenuItem>
                                        <MenuItem value="stats.views">Most Viewed</MenuItem>
                                        <MenuItem value="title">Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                    startIcon={<SearchIcon />}
                                    sx={{
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        borderRadius: '12px',
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                            boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                        },
                                    }}
                                >
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Fade>

                {/* Loading State */}
                {loading.memes ? (
                    <LoadingSpinner message="Loading memes..." />
                ) : (
                    <>
                        {/* Enhanced Memes Grid */}
                        <Grid container spacing={3}>
                            {memes.map((meme, index) => (
                                <Grid item xs={12} sm={6} md={4} key={meme.id}>
                                    <Slide direction="up" in={true} timeout={800 + index * 100}>
                                        <Card
                                            sx={{
                                                height: '500px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(20px)',
                                                border: mode === 'dark'
                                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    background: mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.08)'
                                                        : 'rgba(255, 255, 255, 1)',
                                                    boxShadow: mode === 'dark'
                                                        ? '0 20px 60px rgba(99, 102, 241, 0.3)'
                                                        : '0 20px 60px rgba(99, 102, 241, 0.2)',
                                                    borderColor: mode === 'dark'
                                                        ? 'rgba(99, 102, 241, 0.4)'
                                                        : 'rgba(99, 102, 241, 0.3)',
                                                },
                                            }}
                                            onClick={() => navigate(`/meme/${meme.id}`)}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={meme.imageUrl}
                                                alt={meme.title}
                                                sx={{ 
                                                    objectFit: 'cover',
                                                    borderRadius: '16px 16px 0 0',
                                                }}
                                            />
                                            <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                                                <Typography 
                                                    variant="h6" 
                                                    component="h3" 
                                                    gutterBottom
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: 600,
                                                        color: theme.palette.text.primary,
                                                        mb: 2,
                                                    }}
                                                >
                                                    {meme.title}
                                                </Typography>
                                                
                                                {/* Creator Info */}
                                                {meme.creator && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar 
                                                            src={meme.creator.profile?.avatar} 
                                                            sx={{ 
                                                                width: 24, 
                                                                height: 24, 
                                                                mr: 1,
                                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                            }}
                                                        >
                                                            {meme.creator.username?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                flexGrow: 1,
                                                                color: theme.palette.text.secondary,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            by {meme.creator.profile?.displayName || meme.creator.username}
                                                        </Typography>
                                                        <Box onClick={(e) => e.stopPropagation()}>
                                                            <FollowButton 
                                                                userId={meme.creator._id} 
                                                                username={meme.creator.username}
                                                                variant="chip"
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Box>
                                                )}
                                                
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        label={meme.category} 
                                                        size="small" 
                                                        sx={{
                                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            '& .MuiChip-label': {
                                                                color: 'white'
                                                            }
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={`❤️ ${meme.stats.likesCount}`} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: theme.palette.primary.main,
                                                            color: theme.palette.primary.main,
                                                        }}
                                                    />
                                                </Box>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        color: theme.palette.text.secondary,
                                                        lineHeight: 1.5,
                                                        flex: 1,
                                                    }}
                                                >
                                                    {meme.description || 'No description available'}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'space-between', p: 2 }} onClick={(e) => e.stopPropagation()}>
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        color={meme.isLiked ? 'error' : 'default'}
                                                        onClick={(e) => handleLike(meme.id, e)}
                                                        title="Like meme"
                                                        sx={{
                                                            '&:hover': {
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        {meme.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleDownload(meme, e)}
                                                        title="Download meme"
                                                        sx={{
                                                            '&:hover': {
                                                                background: 'rgba(99, 102, 241, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <ReportButton
                                                        contentType="meme"
                                                        contentId={meme.id}
                                                        reportedUserId={meme.createdBy?.id || meme.createdBy}
                                                        variant="icon"
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ color: theme.palette.text.secondary }}
                                                >
                                                    {new Date(meme.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </CardActions>
                                        </Card>
                                    </Slide>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Enhanced Pagination */}
                        {pagination.totalPages > 1 && (
                            <Fade in={true} timeout={1500}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(20px)',
                                            border: mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : '1px solid rgba(99, 102, 241, 0.1)',
                                            borderRadius: '16px',
                                        }}
                                    >
                                        <Pagination
                                            count={pagination.totalPages}
                                            page={pagination.currentPage}
                                            onChange={handlePageChange}
                                            color="primary"
                                            size="large"
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    borderRadius: '12px',
                                                    fontWeight: 600,
                                                },
                                                '& .Mui-selected': {
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'}) !important`,
                                                    color: 'white',
                                                }
                                            }}
                                        />
                                    </Paper>
                                </Box>
                            </Fade>
                        )}

                        {/* Enhanced No Results */}
                        {memes.length === 0 && !loading.memes && (
                            <Fade in={true} timeout={1000}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 8,
                                        textAlign: 'center',
                                        background: mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(20px)',
                                        border: mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                        borderRadius: '20px',
                                    }}
                                >
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom
                                        sx={{ 
                                            fontWeight: 600,
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        No memes found
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        Try adjusting your search criteria or create the first meme!
                                    </Typography>
                                </Paper>
                            </Fade>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default MemeGallery;
