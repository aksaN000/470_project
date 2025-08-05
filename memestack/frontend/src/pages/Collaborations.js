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
    AvatarGroup,
    Paper,
    Fade,
    Zoom,
    useTheme,
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
import { useThemeMode } from '../contexts/ThemeContext';
import api, { collaborationsAPI } from '../services/api';

const Collaborations = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
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
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
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
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            🤝 Collaborations & Remixes
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Work together to create amazing memes and content!
                                        </Typography>
                                    </Box>
                                    {user && (
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setCreateDialogOpen(true)}
                                            size="large"
                                            sx={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                color: 'white',
                                                borderRadius: '16px',
                                                px: 3,
                                                py: 1.5,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                            }}
                                        >
                                            Start Collaboration
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(99, 102, 241, 0.1)',
                                borderRadius: '20px',
                                p: 4,
                            }}
                        >
                        {/* Tabs */}
                        <Box sx={{ 
                            borderBottom: 1, 
                            borderColor: 'divider', 
                            mb: 3,
                            background: mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.15)',
                            borderRadius: 2,
                            p: 1
                        }}>
                            <Tabs 
                                value={tabValue} 
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{
                                    '& .MuiTab-root': {
                                        fontWeight: 600,
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }
                                    }
                                }}
                            >
                                <Tab label="All Projects" icon={<Handshake />} iconPosition="start" />
                                <Tab label="Trending" icon={<TrendingUp />} iconPosition="start" />
                                {user && <Tab label="My Projects" icon={<Star />} iconPosition="start" />}
                            </Tabs>
                        </Box>

                        {/* Filters */}
                        {tabValue === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    background: mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                                    p: 3,
                                    mb: 3
                                }}
                            >
                                <Box display="flex" gap={2} flexWrap="wrap">
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
                            </Paper>
                        )}

                        {/* Loading */}
                        {loading && <LinearProgress sx={{ mb: 3 }} />}

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'}`,
                                p: 3
                            }}
                        >
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
                        </Paper>

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
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Collaborations;
