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
import LoadingSpinner from '../components/common/LoadingSpinner';
import FollowButton from '../components/common/FollowButton';

const BrowseUsers = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    👥 Discover Creators
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Find and follow amazing meme creators
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 4 }}>
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
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
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
                        <FormControl fullWidth>
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
            </Box>

            {loading ? (
                <LoadingSpinner message="Loading creators..." />
            ) : users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No users found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Users Grid */}
                    <Grid container spacing={3}>
                        {users.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    onClick={() => navigate(`/user/${user.id}`)}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Avatar
                                            src={user.avatar}
                                            sx={{ 
                                                width: 80, 
                                                height: 80, 
                                                mx: 'auto', 
                                                mb: 2,
                                                fontSize: '2rem',
                                            }}
                                        >
                                            {user.username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        
                                        <Typography variant="h6" gutterBottom>
                                            {user.displayName || user.username}
                                        </Typography>
                                        
                                        {user.displayName && (
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                @{user.username}
                                            </Typography>
                                        )}
                                        
                                        {user.bio && (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                sx={{ 
                                                    mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {user.bio}
                                            </Typography>
                                        )}
                                        
                                        {/* User Stats */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                                            <Chip 
                                                icon={<MemeIcon />}
                                                label={user.stats?.memesCreated || 0} 
                                                size="small" 
                                                variant="outlined"
                                                title="Memes created"
                                            />
                                            <Chip 
                                                icon={<LikeIcon />}
                                                label={user.stats?.totalLikes || 0} 
                                                size="small" 
                                                variant="outlined"
                                                title="Total likes received"
                                            />
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                            <Chip 
                                                icon={<CalendarIcon />}
                                                label={`Joined ${new Date(user.joinDate).getFullYear()}`} 
                                                size="small" 
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                        
                                        {/* Follow Button */}
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

export default BrowseUsers;
