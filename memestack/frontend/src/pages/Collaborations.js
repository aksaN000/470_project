// 🤝 Collaborations Page Component
// Displays all collaborations, remixes, and collaborative projects

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
    Handshake,
    People,
    Shuffle,
    Add,
    Search,
    TrendingUp,
    Star,
    Visibility,
    CallSplit,
    Comment,
    Code,
    Palette,
    ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { collaborationsAPI } from '../services/api';

const Collaborations = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [collaborations, setCollaborations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const types = [
        { value: 'remix', label: 'Remix', icon: <Shuffle /> },
        { value: 'collaboration', label: 'Collaboration', icon: <Handshake /> },
        { value: 'template_creation', label: 'Template Creation', icon: <Palette /> },
        { value: 'challenge_response', label: 'Challenge Response', icon: <Star /> }
    ];

    const statuses = [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'reviewing', label: 'Reviewing' },
        { value: 'completed', label: 'Completed' }
    ];

    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'active', label: 'Most Active' }
    ];

    useEffect(() => {
        fetchCollaborations();
    }, [tabValue, searchTerm, typeFilter, statusFilter, sortBy, currentPage]);

    const fetchCollaborations = async () => {
        try {
            setLoading(true);
            
            if (tabValue === 1) {
                // Trending
                const response = await collaborationsAPI.getTrending();
                setCollaborations(response.data);
                setLoading(false);
                return;
            } else if (tabValue === 2) {
                // My collaborations
                if (!user) {
                    setCollaborations([]);
                    setLoading(false);
                    return;
                }
                const response = await collaborationsAPI.getUserCollaborations();
                setCollaborations(response.data);
                setLoading(false);
                return;
            }

            // All collaborations
            const paramsObj = {
                page: currentPage,
                limit: 12,
                sort: sortBy
            };

            if (searchTerm) paramsObj.search = searchTerm;
            if (typeFilter) paramsObj.type = typeFilter;
            if (statusFilter) paramsObj.status = statusFilter;

            const response = await collaborationsAPI.getCollaborations(paramsObj);
            setCollaborations(response.data.collaborations);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching collaborations:', error);
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        const typeData = types.find(t => t.value === type);
        return typeData?.icon || <Handshake />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'reviewing': return 'warning';
            case 'completed': return 'info';
            case 'draft': return 'default';
            default: return 'default';
        }
    };

    const CollaborationCard = ({ collaboration }) => (
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
            onClick={() => navigate(`/collaborations/${collaboration._id}`)}
        >
            {collaboration.originalMeme?.imageUrl && (
                <CardMedia
                    component="img"
                    height="160"
                    image={collaboration.originalMeme.imageUrl}
                    alt={collaboration.title}
                    sx={{ objectFit: 'cover' }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        {getTypeIcon(collaboration.type)}
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {collaboration.title}
                        </Typography>
                    </Box>
                    <Chip 
                        label={collaboration.status.toUpperCase()} 
                        color={getStatusColor(collaboration.status)}
                        size="small"
                    />
                </Box>
                
                <Chip 
                    label={collaboration.type.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                    sx={{ textTransform: 'capitalize', mb: 1 }}
                />

                {collaboration.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {collaboration.description.length > 100 
                            ? `${collaboration.description.substring(0, 100)}...`
                            : collaboration.description
                        }
                    </Typography>
                )}

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Avatar 
                        src={collaboration.owner?.profile?.avatar} 
                        sx={{ width: 24, height: 24 }}
                    >
                        {collaboration.owner?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                        by {collaboration.owner?.profile?.displayName || collaboration.owner?.username}
                    </Typography>
                </Box>

                {/* Collaborators */}
                {collaboration.collaborators && collaboration.collaborators.length > 0 && (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                            {collaboration.collaborators.slice(0, 4).map((collab, index) => (
                                <Avatar 
                                    key={index}
                                    src={collab.user?.profile?.avatar}
                                    sx={{ width: 24, height: 24 }}
                                >
                                    {collab.user?.username?.[0]?.toUpperCase()}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary">
                            +{collaboration.stats?.totalContributors || 0} contributors
                        </Typography>
                    </Box>
                )}

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Code fontSize="small" color="action" />
                            <Typography variant="caption">
                                {collaboration.stats?.totalVersions || 0} versions
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Visibility fontSize="small" color="action" />
                            <Typography variant="caption">
                                {collaboration.stats?.totalViews || 0} views
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CallSplit fontSize="small" color="action" />
                            <Typography variant="caption">
                                {collaboration.stats?.totalForks || 0} forks
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Challenge or Group Info */}
                {collaboration.challenge && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <Star fontSize="small" sx={{ color: 'gold' }} />
                        <Typography variant="caption" color="text.secondary">
                            Challenge: {collaboration.challenge.title}
                        </Typography>
                    </Box>
                )}

                {collaboration.group && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <People fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            Group: {collaboration.group.name}
                        </Typography>
                    </Box>
                )}

                {/* Original Meme Info */}
                {collaboration.originalMeme && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <ContentCopy fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            Based on: {collaboration.originalMeme.title}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    const CreateCollaborationDialog = () => (
        <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Start New Collaboration</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create a collaboration project or remix existing memes!
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {types.map(type => (
                        <Grid item xs={6} key={type.value}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={type.icon}
                                onClick={() => {
                                    setCreateDialogOpen(false);
                                    navigate(`/collaborations/create?type=${type.value}`);
                                }}
                                sx={{ 
                                    height: '60px',
                                    textTransform: 'none',
                                    flexDirection: 'column',
                                    gap: 0.5
                                }}
                            >
                                <Typography variant="body2" fontWeight="bold">
                                    {type.label}
                                </Typography>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
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
                        🤝 Collaborations & Remixes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Work together to create amazing memes and content!
                    </Typography>
                </Box>
                {user && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="large"
                    >
                        Start Collaboration
                    </Button>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="All Projects" icon={<Handshake />} iconPosition="start" />
                    <Tab label="Trending" icon={<TrendingUp />} iconPosition="start" />
                    {user && <Tab label="My Projects" icon={<Star />} iconPosition="start" />}
                </Tabs>
            </Box>

            {/* Filters */}
            {tabValue === 0 && (
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    <TextField
                        placeholder="Search collaborations..."
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
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            label="Type"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {types.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {statuses.map(status => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
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

            {/* Collaborations Grid */}
            <Grid container spacing={3}>
                {collaborations.map((collaboration) => (
                    <Grid item xs={12} sm={6} md={4} key={collaboration._id}>
                        <CollaborationCard collaboration={collaboration} />
                    </Grid>
                ))}
            </Grid>

            {/* Empty State */}
            {!loading && collaborations.length === 0 && (
                <Box textAlign="center" py={6}>
                    <Handshake sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No collaborations found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {tabValue === 2 
                            ? "You haven't started any collaborations yet."
                            : "Be the first to start a collaborative project!"
                        }
                    </Typography>
                    {user && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Start Collaboration
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

            <CreateCollaborationDialog />
        </Container>
    );
};

export default Collaborations;
