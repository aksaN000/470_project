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
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Fade,
    Zoom,
    useTheme,
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
import { useThemeMode } from '../contexts/ThemeContext';
import api, { challengesAPI } from '../services/api';

const Challenges = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
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
            const paramsObj = {
                page: currentPage,
                limit: 12,
                sort: sortBy
            };

            if (tabValue === 0) {
                // All challenges
                if (searchTerm) paramsObj.search = searchTerm;
                if (categoryFilter) paramsObj.category = categoryFilter;
            } else if (tabValue === 1) {
                // Trending
                const response = await challengesAPI.getTrending();
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
                const response = await challengesAPI.getUserChallenges();
                setChallenges(response.data);
                setLoading(false);
                return;
            }

            const response = await challengesAPI.getChallenges(paramsObj);
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
        <Zoom in={true} timeout={800} style={{ transitionDelay: '100ms' }}>
            <Paper
                elevation={0}
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    background: mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: mode === 'dark'
                            ? '0 20px 40px rgba(99, 102, 241, 0.3)'
                            : '0 20px 40px rgba(99, 102, 241, 0.2)',
                        border: mode === 'dark'
                            ? '1px solid rgba(99, 102, 241, 0.3)'
                            : '1px solid rgba(99, 102, 241, 0.2)',
                    }
                }}
                onClick={() => navigate(`/challenges/${challenge._id}`)}
            >
                {challenge.template?.imageUrl && (
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                            component="img"
                            height="160"
                            image={challenge.template.imageUrl}
                            alt={challenge.title}
                            sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                            }}
                        >
                            <Chip 
                                label={challenge.status.toUpperCase()} 
                                sx={{
                                    background: getStatusColor(challenge.status) === 'success' 
                                        ? `linear-gradient(135deg, ${currentThemeColors?.success || '#10b981'}, ${currentThemeColors?.successDark || '#059669'})`
                                        : getStatusColor(challenge.status) === 'warning'
                                        ? `linear-gradient(135deg, ${currentThemeColors?.warning || '#f59e0b'}, ${currentThemeColors?.warningDark || '#d97706'})`
                                        : `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                }}
                                size="small"
                            />
                        </Box>
                    </Box>
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 2,
                        }}
                    >
                        {challenge.title}
                    </Typography>
                    
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 3,
                            lineHeight: 1.6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {challenge.description.length > 100 
                            ? `${challenge.description.substring(0, 100)}...`
                            : challenge.description
                        }
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Avatar 
                            src={challenge.creator?.profile?.avatar} 
                            sx={{ 
                                width: 32, 
                                height: 32,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                            }}
                        >
                            {challenge.creator?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                by {challenge.creator?.profile?.displayName || challenge.creator?.username}
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <People 
                                    fontSize="small" 
                                    sx={{ color: theme.palette.primary.main }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {challenge.stats?.participantCount || 0} participants
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime 
                                    fontSize="small" 
                                    sx={{ color: theme.palette.secondary.main }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {formatTimeRemaining(challenge.endDate)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {challenge.prizes && challenge.prizes.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <EmojiEvents fontSize="small" sx={{ color: '#fbbf24' }} />
                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#fbbf24' }}>
                                {challenge.prizes.length} prize{challenge.prizes.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    )}

                    <Chip 
                        label={challenge.category} 
                        size="small" 
                        sx={{
                            background: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(99, 102, 241, 0.1)',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            border: `1px solid ${theme.palette.primary.main}`,
                        }}
                    />
                </CardContent>
            </Paper>
        </Zoom>
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
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4,
        }}>
            <Container maxWidth="lg">
                <Fade in={true} timeout={1000}>
                    <Box>
                        {/* Enhanced Header */}
                        <Zoom in={true} timeout={1200}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
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
                                <Box sx={{ position: 'relative', textAlign: 'center', width: '100%' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="h3" 
                                            component="h1" 
                                            sx={{
                                                fontWeight: 800,
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 2,
                                            }}
                                        >
                                            {/* Trophy Emoji - Separate for Natural Colors */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(5deg) saturate(1.1) brightness(1.05)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                🏆
                                            </Box>
                                            
                                            {/* Meme Challenges Text with Gradient */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#ec4899'} 100%)`,
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
                                                Meme Challenges
                                            </Box>
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Compete in meme contests and show your creativity!
                                        </Typography>
                                    </Box>
                                    
                                    {/* Absolutely positioned button */}
                                    {user && (
                                        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add sx={{ color: 'inherit' }} />}
                                                onClick={() => setCreateDialogOpen(true)}
                                                size="large"
                                                sx={{
                                                    py: 1.5,
                                                    px: 3,
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                                    textTransform: 'none',
                                                    boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                                        boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                            >
                                                Create Challenge
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Enhanced Tabs */}
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 4,
                                background: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : `${currentThemeColors?.primary || '#6366f1'}20`,
                                borderRadius: '20px',
                                overflow: 'hidden',
                            }}
                        >
                            <Tabs 
                                value={tabValue} 
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{
                                    '& .MuiTab-root': {
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        py: 2,
                                    },
                                    '& .Mui-selected': {
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent !important',
                                    },
                                }}
                            >
                                <Tab label="All Challenges" icon={<EmojiEvents sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />
                                <Tab label="Trending" icon={<TrendingUp sx={{ color: currentThemeColors?.secondary || 'secondary.main' }} />} iconPosition="start" />
                                {user && <Tab label="My Challenges" icon={<Star sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />}
                            </Tabs>
                        </Paper>

                        {/* Enhanced Filters */}
                        {tabValue === 0 && (
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
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    <TextField
                                        placeholder="Search challenges..."
                                        variant="outlined"
                                        size="small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        }}
                                        sx={{
                                            minWidth: 200,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    />
                                    
                                    <FormControl 
                                        size="small" 
                                        sx={{ 
                                            minWidth: 150,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    >
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

                                    <FormControl 
                                        size="small" 
                                        sx={{ 
                                            minWidth: 150,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    >
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
                            </Paper>
                        )}

                        {/* Loading */}
                        {loading && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 3,
                                    background: mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(99, 102, 241, 0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                }}
                            >
                                <LinearProgress 
                                    sx={{
                                        background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        '& .MuiLinearProgress-bar': {
                                            background: `linear-gradient(90deg, ${currentThemeColors?.accent || '#ec4899'}, ${currentThemeColors?.highlight || '#f97316'})`,
                                        },
                                    }}
                                />
                            </Paper>
                        )}

                        {/* Enhanced Challenges Grid */}
                        <Grid container spacing={3}>
                            {challenges.map((challenge) => (
                                <Grid item xs={12} sm={6} md={4} key={challenge._id}>
                                    <ChallengeCard challenge={challenge} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Enhanced Empty State */}
                        {!loading && challenges.length === 0 && (
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
                                        startIcon={<Add sx={{ color: 'inherit' }} />}
                                        onClick={() => setCreateDialogOpen(true)}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                            textTransform: 'none',
                                            boxShadow: `0 8px 32px ${currentThemeColors?.primary || '#6366f1'}50`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b5bf6'}, ${currentThemeColors?.secondaryHover || '#7c3aed'})`,
                                                boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        Create Challenge
                                    </Button>
                                )}
                            </Paper>
                        )}

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={6}>
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
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '10px',
                                                '&:disabled': { opacity: 0.5 },
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Typography sx={{ mx: 2, fontWeight: 600 }}>
                                            {currentPage} of {totalPages}
                                        </Typography>
                                        <Button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '10px',
                                                '&:disabled': { opacity: 0.5 },
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        <CreateChallengeDialog />
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Challenges;
