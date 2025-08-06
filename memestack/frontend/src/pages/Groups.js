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
    AvatarGroup,
    Paper,
    Fade,
    Zoom,
    useTheme,
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
import { useThemeMode } from '../contexts/ThemeContext';
import api, { groupsAPI } from '../services/api';

const Groups = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const { mode, currentThemeColors } = useThemeMode();
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
                const response = await groupsAPI.getTrending();
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
                const response = await groupsAPI.getUserGroups();
                setGroups(response.data);
                setLoading(false);
                return;
            }

            // All groups
            const paramsObj = {
                page: currentPage,
                limit: 12,
                sort: sortBy
            };

            if (searchTerm) paramsObj.search = searchTerm;
            if (categoryFilter) paramsObj.category = categoryFilter;

            const response = await groupsAPI.getGroups(paramsObj);
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
        <Zoom in={true} timeout={800} style={{ transitionDelay: '100ms' }}>
            <Paper
                elevation={0}
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    background: mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                    backdropFilter: 'blur(50px)',
                    WebkitBackdropFilter: 'blur(50px)',
                    border: mode === 'dark'
                        ? '2px solid rgba(255, 255, 255, 0.3)'
                        : '2px solid rgba(0, 0, 0, 0.15)',
                    borderTop: mode === 'dark'
                        ? '3px solid rgba(255, 255, 255, 0.4)'
                        : '3px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '20px',
                    boxShadow: mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        background: mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                        border: mode === 'dark'
                            ? '2px solid rgba(255, 255, 255, 0.4)'
                            : '2px solid rgba(0, 0, 0, 0.25)',
                        borderTop: mode === 'dark'
                            ? '3px solid rgba(255, 255, 255, 0.5)'
                            : '3px solid rgba(0, 0, 0, 0.3)',
                        boxShadow: mode === 'dark'
                            ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                    },
                }}
                onClick={() => navigate(`/groups/${group.slug}`)}
            >
                {group.banner && (
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                            component="img"
                            height="120"
                            image={group.banner}
                            alt={group.name}
                            sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                        />
                    </Box>
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                        <Avatar 
                            src={group.avatar} 
                            sx={{ 
                                width: 48, 
                                height: 48,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                border: group.verified ? '3px solid #1976d2' : `2px solid ${currentThemeColors?.primary || '#6366f1'}30`,
                                boxShadow: `0 4px 16px ${currentThemeColors?.primary || '#6366f1'}50`,
                            }}
                        >
                            <GroupsIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Typography 
                                    variant="h6" 
                                    component="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {group.name}
                                </Typography>
                                {group.verified && (
                                    <Verified sx={{ color: '#1976d2' }} fontSize="small" />
                                )}
                                {group.featured && (
                                    <Star sx={{ color: '#fbbf24' }} fontSize="small" />
                                )}
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                    icon={getPrivacyIcon(group.privacy)}
                                    label={group.privacy.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                        background: mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        border: mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.3)'
                                            : '1px solid rgba(0, 0, 0, 0.2)',
                                        color: getPrivacyColor(group.privacy) === 'success' 
                                            ? '#10b981'
                                            : getPrivacyColor(group.privacy) === 'error'
                                            ? '#ef4444'
                                            : getPrivacyColor(group.privacy) === 'warning'
                                            ? '#f59e0b'
                                            : '#6366f1',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        boxShadow: mode === 'dark'
                                            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                            : 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                        '& .MuiChip-icon': { 
                                            color: getPrivacyColor(group.privacy) === 'success' 
                                                ? '#10b981'
                                                : getPrivacyColor(group.privacy) === 'error'
                                                ? '#ef4444'
                                                : getPrivacyColor(group.privacy) === 'warning'
                                                ? '#f59e0b'
                                                : '#6366f1'
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    
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
                        {group.description.length > 120 
                            ? `${group.description.substring(0, 120)}...`
                            : group.description
                        }
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Avatar 
                            src={group.creator?.profile?.avatar} 
                            sx={{ 
                                width: 24, 
                                height: 24,
                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                            }}
                        >
                            {group.creator?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Created by {group.creator?.profile?.displayName || group.creator?.username}
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <People 
                                    fontSize="small" 
                                    sx={{ color: theme.palette.primary.main }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {group.stats?.memberCount || 0} members
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: theme.palette.secondary.main }}>
                                {group.stats?.postCount || 0} posts
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Enhanced Recent Active Members */}
                    {group.members && group.members.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <AvatarGroup 
                                max={4} 
                                sx={{ 
                                    '& .MuiAvatar-root': { 
                                        width: 28, 
                                        height: 28,
                                        border: `2px solid ${currentThemeColors?.primary || '#6366f1'}30`,
                                        background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                    } 
                                }}
                            >
                                {group.members.slice(0, 4).map((member, index) => (
                                    <Avatar 
                                        key={index}
                                        src={member.user?.profile?.avatar}
                                        sx={{ width: 28, height: 28 }}
                                    >
                                        {member.user?.username?.[0]?.toUpperCase()}
                                    </Avatar>
                                ))}
                            </AvatarGroup>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Active members
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                            label={group.category} 
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
                        {group.userRole && (
                            <Chip 
                                label={group.userRole} 
                                size="small" 
                                sx={{
                                    background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
            </Paper>
        </Zoom>
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
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                    backdropFilter: 'blur(50px)',
                                    WebkitBackdropFilter: 'blur(50px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.4)'
                                        : '3px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: '24px',
                                    boxShadow: mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        background: mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.4)'
                                            : '2px solid rgba(0, 0, 0, 0.25)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.5)'
                                            : '3px solid rgba(0, 0, 0, 0.3)',
                                        boxShadow: mode === 'dark'
                                            ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                            : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                    },
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
                                                gap: 1.5,
                                            }}
                                        >
                                            {/* People Emoji - Separate for Natural Colors */}
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 'inherit',
                                                    filter: 'hue-rotate(0deg) saturate(1.0) brightness(1.0)',
                                                    '&:hover': {
                                                        transform: 'scale(1.1) rotate(2deg)',
                                                        transition: 'transform 0.3s ease',
                                                    },
                                                }}
                                            >
                                                👥
                                            </Box>
                                            
                                            {/* Meme Communities Text with Gradient */}
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
                                                Meme Communities
                                            </Box>
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                            }}
                                        >
                                            Join communities and share memes with like-minded people!
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
                                                Create Group
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
                                    ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.3)'
                                    : '2px solid rgba(0, 0, 0, 0.15)',
                                borderTop: mode === 'dark'
                                    ? '3px solid rgba(255, 255, 255, 0.4)'
                                    : '3px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: '20px',
                                boxShadow: mode === 'dark'
                                    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(0, 0, 0, 0.25)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.5)'
                                        : '3px solid rgba(0, 0, 0, 0.3)',
                                    boxShadow: mode === 'dark'
                                        ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                },
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
                                <Tab label="All Groups" icon={<GroupsIcon sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />
                                <Tab label="Trending" icon={<TrendingUp sx={{ color: currentThemeColors?.secondary || 'secondary.main' }} />} iconPosition="start" />
                                {user && <Tab label="My Groups" icon={<Star sx={{ color: currentThemeColors?.primary || 'primary.main' }} />} iconPosition="start" />}
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
                                        ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                    backdropFilter: 'blur(40px)',
                                    WebkitBackdropFilter: 'blur(40px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.3)'
                                        : '2px solid rgba(0, 0, 0, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.4)'
                                        : '3px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: '20px',
                                    boxShadow: mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.25) 100%)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.4)'
                                            : '2px solid rgba(0, 0, 0, 0.25)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.5)'
                                            : '3px solid rgba(0, 0, 0, 0.3)',
                                        boxShadow: mode === 'dark'
                                            ? '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                            : '0 16px 48px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                                    },
                                }}
                            >
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    <TextField
                                        placeholder="Search groups..."
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
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                    backdropFilter: 'blur(40px)',
                                    border: mode === 'dark'
                                        ? '2px solid rgba(255, 255, 255, 0.15)'
                                        : '2px solid rgba(99, 102, 241, 0.15)',
                                    borderTop: mode === 'dark'
                                        ? '3px solid rgba(255, 255, 255, 0.25)'
                                        : '3px solid rgba(99, 102, 241, 0.25)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: mode === 'dark'
                                        ? '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                        : '0 8px 30px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                                }}
                            >
                                <LinearProgress 
                                    sx={{
                                        background: `linear-gradient(90deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`,
                                        '& .MuiLinearProgress-bar': {
                                            background: `linear-gradient(90deg, ${currentThemeColors?.accent || '#ec4899'}, ${currentThemeColors?.tertiary || '#f97316'})`,
                                        },
                                    }}
                                />
                            </Paper>
                        )}

                        {/* Enhanced Groups Grid */}
                        <Grid container spacing={3}>
                            {groups.map((group) => (
                                <Grid item xs={12} sm={6} md={4} key={group._id}>
                                    <GroupCard group={group} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Enhanced Empty State */}
                        {!loading && groups.length === 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
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
                                    boxShadow: mode === 'dark'
                                        ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                        : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                                }}
                            >
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
                                                background: `linear-gradient(135deg, ${currentThemeColors?.primary || '#5b5bf6'}, ${currentThemeColors?.secondary || '#7c3aed'})`,
                                                boxShadow: `0 12px 40px ${currentThemeColors?.primary || '#6366f1'}60`,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        Create Group
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
                                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                                        backdropFilter: 'blur(40px)',
                                        border: mode === 'dark'
                                            ? '2px solid rgba(255, 255, 255, 0.15)'
                                            : '2px solid rgba(99, 102, 241, 0.15)',
                                        borderTop: mode === 'dark'
                                            ? '3px solid rgba(255, 255, 255, 0.25)'
                                            : '3px solid rgba(99, 102, 241, 0.25)',
                                        borderRadius: '16px',
                                        boxShadow: mode === 'dark'
                                            ? '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                            : '0 8px 30px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
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

                        <CreateGroupDialog />
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Groups;
