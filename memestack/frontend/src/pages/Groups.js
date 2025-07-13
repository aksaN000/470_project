// 👥 Groups Page Component
// Displays all community groups and meme communities

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
    DialogActions,
    Badge,
    AvatarGroup
} from '@mui/material';
import {
    Groups as GroupsIcon,
    People,
    Public,
    Lock,
    Add,
    Search,
    TrendingUp,
    Star,
    Verified,
    Settings,
    Launch
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Groups = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        'general', 'gaming', 'sports', 'politics', 'entertainment',
        'technology', 'science', 'art', 'music', 'education',
        'business', 'lifestyle', 'food', 'travel', 'fashion',
        'dank', 'wholesome', 'dark_humor', 'nsfw', 'regional'
    ];

    const sortOptions = [
        { value: 'popular', label: 'Most Popular' },
        { value: 'newest', label: 'Newest' },
        { value: 'active', label: 'Most Active' },
        { value: 'featured', label: 'Featured' }
    ];

    useEffect(() => {
        fetchGroups();
    }, [tabValue, searchTerm, categoryFilter, sortBy, currentPage]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            
            if (tabValue === 1) {
                // Trending
                const response = await api.get('/api/groups/trending');
                setGroups(response.data);
                setLoading(false);
                return;
            } else if (tabValue === 2) {
                // My groups
                if (!user) {
                    setGroups([]);
                    setLoading(false);
                    return;
                }
                const response = await api.get('/api/groups/user/groups');
                setGroups(response.data);
                setLoading(false);
                return;
            }

            // All groups
            const params = new URLSearchParams({
                page: currentPage,
                limit: 12,
                sort: sortBy
            });

            if (searchTerm) params.append('search', searchTerm);
            if (categoryFilter) params.append('category', categoryFilter);

            const response = await api.get(`/api/groups?${params}`);
            setGroups(response.data.groups);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setLoading(false);
        }
    };

    const getPrivacyIcon = (privacy) => {
        switch (privacy) {
            case 'public': return <Public fontSize="small" />;
            case 'private': return <Lock fontSize="small" />;
            case 'invite_only': return <Lock fontSize="small" color="warning" />;
            default: return <Public fontSize="small" />;
        }
    };

    const getPrivacyColor = (privacy) => {
        switch (privacy) {
            case 'public': return 'success';
            case 'private': return 'error';
            case 'invite_only': return 'warning';
            default: return 'default';
        }
    };

    const GroupCard = ({ group }) => (
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
            onClick={() => navigate(`/groups/${group.slug}`)}
        >
            {group.banner && (
                <CardMedia
                    component="img"
                    height="120"
                    image={group.banner}
                    alt={group.name}
                    sx={{ objectFit: 'cover' }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Avatar 
                        src={group.avatar} 
                        sx={{ 
                            width: 48, 
                            height: 48,
                            border: group.verified ? '2px solid #1976d2' : 'none'
                        }}
                    >
                        <GroupsIcon />
                    </Avatar>
                    <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                {group.name}
                            </Typography>
                            {group.verified && (
                                <Verified color="primary" fontSize="small" />
                            )}
                            {group.featured && (
                                <Star sx={{ color: 'gold' }} fontSize="small" />
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                                icon={getPrivacyIcon(group.privacy)}
                                label={group.privacy.replace('_', ' ')}
                                size="small"
                                color={getPrivacyColor(group.privacy)}
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {group.description.length > 120 
                        ? `${group.description.substring(0, 120)}...`
                        : group.description
                    }
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Avatar 
                        src={group.creator?.profile?.avatar} 
                        sx={{ width: 20, height: 20 }}
                    >
                        {group.creator?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                        Created by {group.creator?.profile?.displayName || group.creator?.username}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <People fontSize="small" color="action" />
                            <Typography variant="caption">
                                {group.stats?.memberCount || 0} members
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                {group.stats?.postCount || 0} posts
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Recent Active Members */}
                {group.members && group.members.length > 0 && (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                            {group.members.slice(0, 4).map((member, index) => (
                                <Avatar 
                                    key={index}
                                    src={member.user?.profile?.avatar}
                                    sx={{ width: 24, height: 24 }}
                                >
                                    {member.user?.username?.[0]?.toUpperCase()}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary">
                            Active members
                        </Typography>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                        label={group.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                    />
                    {group.userRole && (
                        <Chip 
                            label={group.userRole} 
                            size="small" 
                            color="primary"
                            sx={{ textTransform: 'capitalize' }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    const CreateGroupDialog = () => (
        <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Group</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start your own meme community and bring people together!
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        setCreateDialogOpen(false);
                        navigate('/groups/create');
                    }}
                    sx={{ mt: 2 }}
                >
                    Create Group
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
                        👥 Meme Communities
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Join communities and share memes with like-minded people!
                    </Typography>
                </Box>
                {user && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="large"
                    >
                        Create Group
                    </Button>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="All Groups" icon={<GroupsIcon />} iconPosition="start" />
                    <Tab label="Trending" icon={<TrendingUp />} iconPosition="start" />
                    {user && <Tab label="My Groups" icon={<Star />} iconPosition="start" />}
                </Tabs>
            </Box>

            {/* Filters */}
            {tabValue === 0 && (
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    <TextField
                        placeholder="Search groups..."
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

            {/* Groups Grid */}
            <Grid container spacing={3}>
                {groups.map((group) => (
                    <Grid item xs={12} sm={6} md={4} key={group._id}>
                        <GroupCard group={group} />
                    </Grid>
                ))}
            </Grid>

            {/* Empty State */}
            {!loading && groups.length === 0 && (
                <Box textAlign="center" py={6}>
                    <GroupsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No groups found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {tabValue === 2 
                            ? "You haven't joined any groups yet."
                            : "Be the first to create a meme community!"
                        }
                    </Typography>
                    {user && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Group
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

            <CreateGroupDialog />
        </Container>
    );
};

export default Groups;
