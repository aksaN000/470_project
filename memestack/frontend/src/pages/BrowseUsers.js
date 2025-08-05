// 👥 Browse Users Page Component
// Discover and follow other creators

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Fade,
    Zoom,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    PhotoLibrary as MemeIcon,
    Favorite as LikeIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FollowButton from '../components/common/FollowButton';

const BrowseUsers = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        hasNext: false
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getUsers(filters);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Handle search
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (event, page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: mode === 'light' 
                ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
                                        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                                    },
                                }}
                            >
                                <Typography 
                                    variant="h3" 
                                    component="h1" 
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                        mb: 2,
                                    }}
                                >
                                    👥 Discover Creators
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                    }}
                                >
                                    Find and follow amazing meme creators from our community
                                </Typography>
                            </Paper>
                        </Zoom>

                        {/* Enhanced Filters */}
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
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search users..."
                                        defaultValue={filters.search}
                                        onKeyPress={handleSearch}
                                        onBlur={handleSearch}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                                '&:hover': {
                                                    background: mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.08)'
                                                        : 'rgba(255, 255, 255, 1)',
                                                },
                                                '&.Mui-focused': {
                                                    background: mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.08)'
                                                        : 'rgba(255, 255, 255, 1)',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl 
                                        fullWidth
                                        sx={{
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
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="createdAt">Join Date</MenuItem>
                                            <MenuItem value="stats.memesCreated">Memes Created</MenuItem>
                                            <MenuItem value="stats.totalLikes">Total Likes</MenuItem>
                                            <MenuItem value="username">Username</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl 
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                            },
                                        }}
                                    >
                                        <InputLabel>Order</InputLabel>
                                        <Select
                                            value={filters.sortOrder}
                                            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                            label="Order"
                                        >
                                            <MenuItem value="desc">Newest First</MenuItem>
                                            <MenuItem value="asc">Oldest First</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

            {loading ? (
                <LoadingSpinner message="Loading creators..." />
            ) : users.length === 0 ? (
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
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No users found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Paper>
            ) : (
                <>
                    {/* Enhanced Users Grid */}
                    <Grid container spacing={3}>
                        {users.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <Zoom in={true} timeout={800} style={{ transitionDelay: '100ms' }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            height: '100%',
                                            cursor: 'pointer',
                                            background: mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(20px)',
                                            border: mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : '1px solid rgba(99, 102, 241, 0.1)',
                                            borderRadius: '20px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: mode === 'dark'
                                                    ? '0 20px 40px rgba(99, 102, 241, 0.3)'
                                                    : '0 20px 40px rgba(99, 102, 241, 0.2)',
                                                border: mode === 'dark'
                                                    ? '1px solid rgba(99, 102, 241, 0.3)'
                                                    : '1px solid rgba(99, 102, 241, 0.2)',
                                            },
                                        }}
                                        onClick={() => navigate(`/user/${user.id}`)}
                                    >
                                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                            <Avatar
                                                src={user.avatar}
                                                sx={{ 
                                                    width: 80, 
                                                    height: 80, 
                                                    mx: 'auto', 
                                                    mb: 3,
                                                    fontSize: '2rem',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    border: '3px solid',
                                                    borderColor: mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.1)' 
                                                        : 'rgba(99, 102, 241, 0.2)',
                                                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                                }}
                                            >
                                                {user.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                }}
                                            >
                                                {user.displayName || user.username}
                                            </Typography>
                                            
                                            {user.displayName && (
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary" 
                                                    gutterBottom
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    @{user.username}
                                                </Typography>
                                            )}
                                            
                                            {user.bio && (
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        mb: 3,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {user.bio}
                                                </Typography>
                                            )}
                                            
                                            {/* Enhanced User Stats */}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                                                <Chip 
                                                    icon={<MemeIcon />}
                                                    label={user.stats?.memesCreated || 0} 
                                                    size="small" 
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        '& .MuiChip-icon': { color: 'white' },
                                                    }}
                                                    title="Memes created"
                                                />
                                                <Chip 
                                                    icon={<LikeIcon />}
                                                    label={user.stats?.totalLikes || 0} 
                                                    size="small" 
                                                    sx={{
                                                        background: mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.1)'
                                                            : 'rgba(99, 102, 241, 0.1)',
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        border: `1px solid ${theme.palette.primary.main}`,
                                                        '& .MuiChip-icon': { color: theme.palette.primary.main },
                                                    }}
                                                    title="Total likes received"
                                                />
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                                <Chip 
                                                    icon={<CalendarIcon />}
                                                    label={`Joined ${new Date(user.joinDate).getFullYear()}`} 
                                                    size="small" 
                                                    sx={{
                                                        background: mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.05)'
                                                            : 'rgba(255, 255, 255, 0.8)',
                                                        color: theme.palette.text.secondary,
                                                        fontWeight: 500,
                                                        '& .MuiChip-icon': { color: theme.palette.text.secondary },
                                                    }}
                                                />
                                            </Box>
                                            
                                            {/* Enhanced Follow Button */}
                                            {currentUser && currentUser._id !== user.id && (
                                                <Box sx={{ mt: 2 }}>
                                                    <FollowButton 
                                                        userId={user.id} 
                                                        username={user.username}
                                                        variant="button"
                                                        size="small"
                                                        onFollowChange={() => {
                                                            // Optionally refresh the list or update local state
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Paper>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Enhanced Pagination */}
                    {pagination.totalPages > 1 && (
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
                                            fontWeight: 600,
                                        },
                                        '& .Mui-selected': {
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6) !important',
                                            color: 'white',
                                        },
                                    }}
                                />
                            </Paper>
                        </Box>
                    )}
                </>
            )}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default BrowseUsers;
