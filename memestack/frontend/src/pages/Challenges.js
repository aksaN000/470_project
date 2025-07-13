// 🏆 Challenges Page Component
// Displays all meme challenges and contests

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
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Avatar,
    LinearProgress,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    EmojiEvents,
    People,
    AccessTime,
    Visibility,
    Add,
    Search,
    TrendingUp,
    Schedule,
    Star,
    Share,
    ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Challenges = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        'reaction', 'mocking', 'success', 'fail', 'advice',
        'rage', 'philosoraptor', 'first_world_problems', 
        'conspiracy', 'confession', 'socially_awkward',
        'good_guy', 'scumbag', 'popular', 'classic', 'freestyle'
    ];

    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'ending_soon', label: 'Ending Soon' },
        { value: 'featured', label: 'Featured' }
    ];

    const statusFilters = [
        { value: '', label: 'All Challenges' },
        { value: 'active', label: 'Active' },
        { value: 'voting', label: 'Voting Phase' },
        { value: 'completed', label: 'Completed' }
    ];

    useEffect(() => {
        fetchChallenges();
    }, [tabValue, searchTerm, categoryFilter, sortBy, currentPage]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 12,
                sort: sortBy
            });

            if (tabValue === 0) {
                // All challenges
                if (searchTerm) params.append('search', searchTerm);
                if (categoryFilter) params.append('category', categoryFilter);
            } else if (tabValue === 1) {
                // Trending
                const response = await api.get('/api/challenges/trending');
                setChallenges(response.data);
                setLoading(false);
                return;
            } else if (tabValue === 2) {
                // My challenges
                if (!user) {
                    setChallenges([]);
                    setLoading(false);
                    return;
                }
                const response = await api.get('/api/challenges/user/challenges');
                setChallenges(response.data);
                setLoading(false);
                return;
            }

            const response = await api.get(`/api/challenges?${params}`);
            setChallenges(response.data.challenges);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            setLoading(false);
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

    const ChallengeCard = ({ challenge }) => (
        <Card 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
            onClick={() => navigate(`/challenges/${challenge._id}`)}
        >
            {challenge.template?.imageUrl && (
                <CardMedia
                    component="img"
                    height="160"
                    image={challenge.template.imageUrl}
                    alt={challenge.title}
                    sx={{ objectFit: 'cover' }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {challenge.title}
                    </Typography>
                    <Chip 
                        label={challenge.status.toUpperCase()} 
                        color={getStatusColor(challenge.status)}
                        size="small"
                    />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {challenge.description.length > 100 
                        ? `${challenge.description.substring(0, 100)}...`
                        : challenge.description
                    }
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Avatar 
                        src={challenge.creator?.profile?.avatar} 
                        sx={{ width: 24, height: 24 }}
                    >
                        {challenge.creator?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                        by {challenge.creator?.profile?.displayName || challenge.creator?.username}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <People fontSize="small" color="action" />
                            <Typography variant="caption">
                                {challenge.stats?.participantCount || 0} participants
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="caption">
                                {formatTimeRemaining(challenge.endDate)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {challenge.prizes && challenge.prizes.length > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <EmojiEvents fontSize="small" sx={{ color: 'gold' }} />
                        <Typography variant="caption" color="text.secondary">
                            {challenge.prizes.length} prize{challenge.prizes.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                )}

                <Chip 
                    label={challenge.category} 
                    size="small" 
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                />
            </CardContent>
        </Card>
    );

    const CreateChallengeDialog = () => (
        <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start a meme challenge and let the community compete!
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        setCreateDialogOpen(false);
                        navigate('/challenges/create');
                    }}
                    sx={{ mt: 2 }}
                >
                    Create Challenge
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        🏆 Meme Challenges
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Compete in meme contests and show your creativity!
                    </Typography>
                </Box>
                {user && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="large"
                    >
                        Create Challenge
                    </Button>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="All Challenges" icon={<EmojiEvents />} iconPosition="start" />
                    <Tab label="Trending" icon={<TrendingUp />} iconPosition="start" />
                    {user && <Tab label="My Challenges" icon={<Star />} iconPosition="start" />}
                </Tabs>
            </Box>

            {/* Filters */}
            {tabValue === 0 && (
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    <TextField
                        placeholder="Search challenges..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                        }}
                        sx={{ minWidth: 200 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>
                                    {cat.replace('_', ' ').toUpperCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            label="Sort By"
                        >
                            {sortOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}

            {/* Loading */}
            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {/* Challenges Grid */}
            <Grid container spacing={3}>
                {challenges.map((challenge) => (
                    <Grid item xs={12} sm={6} md={4} key={challenge._id}>
                        <ChallengeCard challenge={challenge} />
                    </Grid>
                ))}
            </Grid>

            {/* Empty State */}
            {!loading && challenges.length === 0 && (
                <Box textAlign="center" py={6}>
                    <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No challenges found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {tabValue === 2 
                            ? "You haven't joined any challenges yet."
                            : "Be the first to create a meme challenge!"
                        }
                    </Typography>
                    {user && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Challenge
                        </Button>
                    )}
                </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        {currentPage} of {totalPages}
                    </Typography>
                    <Button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </Box>
            )}

            <CreateChallengeDialog />
        </Container>
    );
};

export default Challenges;
