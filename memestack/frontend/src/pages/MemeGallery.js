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
} from '@mui/material';
import { 
    Search as SearchIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMemes } from '../contexts/MemeContext';
import { memeAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReportButton from '../components/moderation/ReportButton';

const MemeGallery = () => {
    const navigate = useNavigate();
    const { 
        memes, 
        pagination, 
        filters, 
        loading, 
        fetchMemes, 
        setFilters 
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

    const categories = [
        'all', 'funny', 'reaction', 'gaming', 'sports', 
        'political', 'wholesome', 'dark', 'trending', 'custom'
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    🖼️ Meme Gallery
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Discover and enjoy the best memes from our community
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search memes..."
                            value={localFilters.search}
                            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                            onKeyPress={handleSearch}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={localFilters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                label="Category"
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
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Loading State */}
            {loading.memes ? (
                <LoadingSpinner message="Loading memes..." />
            ) : (
                <>
                    {/* Memes Grid */}
                    <Grid container spacing={3}>
                        {memes.map((meme) => (
                            <Grid item xs={12} sm={6} md={4} key={meme.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    onClick={() => navigate(`/meme/${meme.id}`)}
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
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <Chip 
                                                label={meme.category} 
                                                size="small" 
                                                color="primary" 
                                            />
                                            <Chip 
                                                label={`❤️ ${meme.stats.likesCount}`} 
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
                                    <CardActions sx={{ justifyContent: 'space-between' }}>
                                        <ReportButton
                                            contentType="meme"
                                            contentId={meme.id}
                                            reportedUserId={meme.createdBy?.id || meme.createdBy}
                                            variant="icon"
                                            size="small"
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleDownload(meme, e)}
                                            title="Download meme"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
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

                    {/* No Results */}
                    {memes.length === 0 && !loading.memes && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" gutterBottom>
                                No memes found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search criteria or create the first meme!
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default MemeGallery;
