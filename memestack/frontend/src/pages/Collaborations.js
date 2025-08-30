// 🤝 Collaborations Page Component
// Displays all collaborations, remixes, and collaborative projects

import React, { useState, useEffect, useCallback } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    Code,
    Palette,
    ContentCopy,
    Notifications
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { collaborationsAPI } from '../services/api';
import PendingInvites from '../components/PendingInvites';
import CollaborationCard from '../components/CollaborationCard';

const Collaborations = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode() || { mode: 'light' };
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
    const [invitesDialogOpen, setInvitesDialogOpen] = useState(false);

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

    const fetchCollaborations = useCallback(async () => {
        try {
            setLoading(true);
            
            if (tabValue === 1) {
                // Trending
                const response = await collaborationsAPI.getTrending();
                console.log('Trending response:', response);
                console.log('🔍 Trending response structure:', {
                    hasData: !!response?.data,
                    hasSuccess: !!response?.success,
                    responseKeys: Object.keys(response || {}),
                    dataLength: response?.data?.length
                });
                
                // Extract trending data - the backend returns { success: true, data: collaborations }
                const data = response?.data || response?.collaborations || [];
                setCollaborations(Array.isArray(data) ? data : []);
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
                console.log('User collaborations response:', response);
                console.log('🔍 User collaborations response structure:', {
                    hasData: !!response?.data,
                    hasCollaborations: !!response?.collaborations,
                    responseKeys: Object.keys(response || {}),
                    dataLength: response?.data?.length,
                    collaborationsLength: response?.collaborations?.length
                });
                
                // Extract user collaborations data
                const data = response?.data || response?.collaborations || [];
                setCollaborations(Array.isArray(data) ? data : []);
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
            console.log('All collaborations response:', response);
            console.log('🔍 Response structure:', {
                hasCollaborations: !!response?.collaborations,
                hasData: !!response?.data,
                hasDataData: !!response?.data?.data,
                responseKeys: Object.keys(response || {}),
                collaborationsLength: response?.collaborations?.length,
                dataLength: response?.data?.length
            });
            
            // Extract collaborations data - the backend returns { collaborations, totalPages, currentPage, total }
            const collaborationsData = response?.collaborations || response?.data?.collaborations || [];
            const totalPagesData = response?.totalPages || response?.data?.totalPages || 1;
            
            setCollaborations(Array.isArray(collaborationsData) ? collaborationsData : []);
            console.log('🔍 Set collaborations state:', collaborationsData);
            console.log('🔍 Collaborations array length:', collaborationsData.length);
            console.log('🔍 Loading state:', false);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching collaborations:', error);
            setCollaborations([]); // Ensure collaborations is always an array
            setLoading(false);
        }
    }, [tabValue, searchTerm, typeFilter, statusFilter, sortBy, currentPage, user]);

    useEffect(() => {
        fetchCollaborations();
    }, [fetchCollaborations]);

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

    const handleDeleteCollaboration = (collaborationId) => {
        // Remove the deleted collaboration from the state
        setCollaborations(prevCollaborations => 
            prevCollaborations.filter(collaboration => collaboration._id !== collaborationId)
        );
    };

    const handlePublishDraft = async (collaborationId, event) => {
        event.stopPropagation(); // Prevent card click navigation
        try {
            // Update to active status and ensure it's public
            await collaborationsAPI.updateCollaboration(collaborationId, { 
                status: 'active',
                'settings.isPublic': true 
            });
            
            // Refresh the collaborations list
            fetchCollaborations();
            
            // You could add a success toast notification here
            console.log('✅ Collaboration published successfully!');
        } catch (error) {
            console.error('❌ Error publishing collaboration:', error);
            // You could add an error toast notification here
        }
    };

    const CollaborationCard = ({ collaboration }) => (
        <Card 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                backdropFilter: 'blur(40px)',
                border: mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.1)'
                    : '2px solid rgba(99, 102, 241, 0.1)',
                borderTop: mode === 'dark'
                    ? '3px solid rgba(255, 255, 255, 0.15)'
                    : '3px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '16px',
                boxShadow: mode === 'dark'
                    ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 12px 40px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: mode === 'dark'
                        ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                        : '0 20px 60px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
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
                        size="small"
                        sx={{
                            background: mode === 'dark'
                                ? getStatusColor(collaboration.status) === 'success' 
                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)'
                                    : getStatusColor(collaboration.status) === 'warning'
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)'
                                    : getStatusColor(collaboration.status) === 'error'
                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)'
                                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                                : getStatusColor(collaboration.status) === 'success' 
                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
                                    : getStatusColor(collaboration.status) === 'warning'
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)'
                                    : getStatusColor(collaboration.status) === 'error'
                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
                                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.15)'
                                : '1px solid rgba(255, 255, 255, 0.3)',
                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'white',
                            fontWeight: 600,
                        }}
                    />
                </Box>
                
                <Chip 
                    label={collaboration.type.replace('_', ' ')} 
                    size="small" 
                    sx={{ 
                        textTransform: 'capitalize', 
                        mb: 1,
                        background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid rgba(99, 102, 241, 0.2)',
                        color: theme.palette.text.primary,
                    }}
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

                {/* Publish Button for Draft Collaborations */}
                {collaboration.status === 'draft' && user && collaboration.owner._id === user._id && (
                    <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={(e) => handlePublishDraft(collaboration._id, e)}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            Publish Collaboration
                        </Button>
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
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                    backdropFilter: 'blur(50px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.15)'
                                        : '2px solid rgba(99, 102, 241, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.25)'
                                        : '3px solid rgba(99, 102, 241, 0.25)',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    boxShadow: mode === 'dark'
                                        ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                        : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
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
                                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                                    {/* Centered Content */}
                                    <Box>
                                        <Typography 
                                            variant="h3" 
                                            component="h1" 
                                            sx={{
                                                fontWeight: 800,
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1.5
                                            }}
                                        >
                                            {/* Handshake Emoji - Separate for Natural Colors */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                🤝
                                            </Box>
                                            
                                            {/* Collaborations & Remixes Text with Gradient */}
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
                                                Collaborations & Remixes
                                            </Box>
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
                                    
                                    {/* Absolutely positioned buttons */}
                                    {user && (
                                        <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Notifications />}
                                                onClick={() => setInvitesDialogOpen(true)}
                                                size="large"
                                                sx={{
                                                    background: mode === 'dark' 
                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                        : 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '16px',
                                                    px: 2,
                                                    py: 1.5,
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                    '&:hover': {
                                                        background: mode === 'dark' 
                                                            ? 'rgba(255, 255, 255, 0.15)'
                                                            : 'rgba(255, 255, 255, 1)',
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    transition: 'all 0.2s ease-in-out',
                                                }}
                                            >
                                                Invites
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add sx={{ color: 'inherit' }} />}
                                                onClick={() => setCreateDialogOpen(true)}
                                                size="large"
                                                sx={{
                                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'} 0%, ${currentThemeColors?.secondary || '#8b5cf6'} 100%)`,
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
                                                        background: `linear-gradient(135deg, ${currentThemeColors?.primaryHover || '#5b21b6'} 0%, ${currentThemeColors?.secondaryHover || '#7c3aed'} 100%)`,
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
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Zoom>

                        {/* Main Content Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                backdropFilter: 'blur(50px)',
                                border: mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.15)'
                                    : '2px solid rgba(99, 102, 241, 0.15)',
                                borderTop: mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.25)'
                                    : '3px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: '20px',
                                p: 4,
                                boxShadow: mode === 'dark'
                                    ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                    : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
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
                                            background: `linear-gradient(45deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }
                                    }
                                }}
                            >
                                <Tab label="All Projects" icon={<Handshake sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />
                                <Tab label="Trending" icon={<TrendingUp sx={{ color: currentThemeColors?.secondary || 'secondary.main' }} />} iconPosition="start" />
                                {user && <Tab label="My Projects" icon={<Star sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />}
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
                        {(() => {
                            console.log('🔍 Loading state check:', { loading });
                            return loading ? <LinearProgress sx={{ mb: 3 }} /> : null;
                        })()}

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
                                {(() => {
                                    console.log('🔍 Render check:', {
                                        loading,
                                        collaborations: collaborations,
                                        collaborationsLength: collaborations?.length,
                                        collaborationsType: typeof collaborations,
                                        isArray: Array.isArray(collaborations)
                                    });
                                    
                                    return !loading && collaborations && collaborations.length > 0 ? collaborations.map((collaboration) => (
                                        <Grid item xs={12} sm={6} md={4} key={collaboration._id}>
                                            <CollaborationCard 
                                                collaboration={collaboration}
                                                onDelete={handleDeleteCollaboration}
                                            />
                                        </Grid>
                                    )) : null;
                                })()}
                            </Grid>

                            {/* Empty State */}
                            {(() => {
                                const shouldShowEmpty = !loading && (!collaborations || collaborations.length === 0);
                                console.log('🔍 Empty state check:', {
                                    loading,
                                    collaborations: collaborations,
                                    collaborationsLength: collaborations?.length,
                                    shouldShowEmpty: shouldShowEmpty
                                });
                                
                                return shouldShowEmpty ? (
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
                                                startIcon={<Add sx={{ color: 'inherit' }} />}
                                                onClick={() => setCreateDialogOpen(true)}
                                            >
                                                Start Collaboration
                                            </Button>
                                        )}
                                    </Box>
                                ) : null;
                            })()}
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
                        <PendingInvites 
                            open={invitesDialogOpen} 
                            onClose={() => setInvitesDialogOpen(false)} 
                        />
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Collaborations;
