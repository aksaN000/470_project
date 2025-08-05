// 📊 Analytics Dashboard Page Component
// Comprehensive analytics and insights for users

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Avatar,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Alert,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Visibility as ViewsIcon,
    Favorite as LikesIcon,
    Share as SharesIcon,
    Download as DownloadsIcon,
    Comment as CommentsIcon,
    People as FollowersIcon,
    PersonAdd as FollowingIcon,
    EmojiEvents as TrophyIcon,
    Assessment as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);
    const [error, setError] = useState(null);

    // Fetch analytics data
    const fetchAnalytics = async (range = timeRange) => {
        try {
            setLoading(true);
            setError(null);
            const response = await analyticsAPI.getDashboard(range);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    // Handle time range change
    const handleTimeRangeChange = (event) => {
        const newRange = event.target.value;
        setTimeRange(newRange);
        fetchAnalytics(newRange);
    };

    // Format numbers for display
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    // Format percentage
    const formatPercentage = (num) => {
        if (isNaN(num)) return '0%';
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">
                    Please log in to view your analytics dashboard.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return <LoadingSpinner message="Loading your analytics..." fullScreen />;
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    const { overview, growth, topMemes, categoryStats } = analytics;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        📊 Analytics Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track your meme performance and audience engagement
                    </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select value={timeRange} onChange={handleTimeRangeChange} label="Time Range">
                        <MenuItem value={7}>Last 7 days</MenuItem>
                        <MenuItem value={30}>Last 30 days</MenuItem>
                        <MenuItem value={90}>Last 3 months</MenuItem>
                        <MenuItem value={365}>Last year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Overview Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Memes"
                        value={overview.totalMemes}
                        icon={<AnalyticsIcon />}
                        growth={growth?.memesGrowth}
                        color="primary"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Likes"
                        value={overview.totalLikes}
                        icon={<LikesIcon />}
                        color="error"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Views"
                        value={overview.totalViews}
                        icon={<ViewsIcon />}
                        color="info"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Followers"
                        value={overview.followersCount}
                        icon={<FollowersIcon />}
                        growth={growth?.followersGrowth}
                        color="success"
                        variant="detailed"
                    />
                </Grid>
            </Grid>

            {/* Secondary Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Shares"
                        value={overview.totalShares}
                        icon={<SharesIcon />}
                        color="secondary"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Downloads"
                        value={overview.totalDownloads}
                        icon={<DownloadsIcon />}
                        color="warning"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Comments"
                        value={overview.totalComments}
                        icon={<CommentsIcon />}
                        color="info"
                        variant="detailed"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg Engagement"
                        value={overview.avgEngagement}
                        icon={<TrendingUpIcon />}
                        color="success"
                        variant="detailed"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Top Performing Memes */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <TrophyIcon color="warning" sx={{ mr: 1 }} />
                                <Typography variant="h6">Top Performing Memes</Typography>
                            </Box>
                            <List>
                                {topMemes?.map((meme, index) => (
                                    <React.Fragment key={meme._id}>
                                        <ListItem
                                            sx={{ 
                                                cursor: 'pointer',
                                                '&:hover': { backgroundColor: 'action.hover' }
                                            }}
                                            onClick={() => navigate(`/meme/${meme._id}`)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={meme.imageUrl} variant="rounded">
                                                    {index + 1}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={meme.title}
                                                secondary={
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            label={`❤️ ${meme.stats?.likesCount || 0}`}
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            size="small"
                                                            label={`👁️ ${meme.stats?.views || 0}`}
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            size="small"
                                                            label={meme.category}
                                                            color="primary"
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < topMemes.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                                {(!topMemes || topMemes.length === 0) && (
                                    <ListItem>
                                        <ListItemText
                                            primary="No memes yet"
                                            secondary="Create some memes to see performance data"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Performance */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Category Performance
                            </Typography>
                            {categoryStats?.map((category) => (
                                <Box key={category._id} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                            {category._id}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.count} memes
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min((category.count / overview.totalMemes) * 100, 100)}
                                        sx={{ mb: 1 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            size="small"
                                            label={`❤️ ${category.totalLikes || 0}`}
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            label={`Avg: ${(category.avgLikes || 0).toFixed(1)}`}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            ))}
                            {(!categoryStats || categoryStats.length === 0) && (
                                <Typography variant="body2" color="text.secondary">
                                    No category data available yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AnalyticsDashboard;
