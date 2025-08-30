import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    LinearProgress,
    Button,
    Chip,
    ButtonGroup,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Zoom,
    Fade,
    Skeleton,
    useTheme,
    alpha,
    useMediaQuery
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Analytics as AnalyticsIcon,
    Visibility as ViewsIcon,
    ThumbUp as LikesIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Comment as CommentIcon,
    Person as FollowersIcon,
    Category as CategoryIcon,
    Timeline as TimelineIcon,
    Star as StarIcon,
    EmojiEvents as TrophyIcon,
    Speed as EngagementIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend, 
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { useThemeMode } from '../contexts/ThemeContext';
import analyticsAPI from '../services/analyticsAPI';

const AnalyticsDashboard = () => {
    const { currentThemeColors } = useThemeMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Ensure no overflow on any screen size
    React.useEffect(() => {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
        
        return () => {
            document.body.style.overflowX = 'auto';
            document.documentElement.style.overflowX = 'auto';
        };
    }, []);
    
    // State management
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30);
    const [refreshing, setRefreshing] = useState(false);

    // Time range options
    const timeRangeOptions = [
        { label: '7 Days', value: 7 },
        { label: '30 Days', value: 30 },
        { label: '90 Days', value: 90 },
        { label: '1 Year', value: 365 }
    ];

    // Chart colors
    const chartColors = {
        primary: currentThemeColors?.primary || '#6366f1',
        secondary: currentThemeColors?.secondary || '#8b5cf6',
        accent: currentThemeColors?.accent || '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
        gradient: `linear-gradient(45deg, ${currentThemeColors?.primary || '#6366f1'}, ${currentThemeColors?.secondary || '#8b5cf6'})`
    };

    // Fetch analytics data
    const fetchAnalytics = useCallback(async (range = timeRange) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await analyticsAPI.getDashboardAnalytics(range);
            
            if (response.success) {
                setAnalyticsData(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch analytics');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    // Refresh analytics
    const refreshAnalytics = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    // Handle time range change
    const handleTimeRangeChange = (newRange) => {
        setTimeRange(newRange);
        fetchAnalytics(newRange);
    };

    // Load analytics on component mount
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Calculate trend direction
    const getTrendIcon = (value) => {
        if (value > 5) return <TrendingUpIcon sx={{ color: chartColors.success }} />;
        if (value < -5) return <TrendingDownIcon sx={{ color: '#ef4444' }} />;
        return <TrendingFlatIcon sx={{ color: chartColors.warning }} />;
    };

    // Format numbers for display
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num?.toLocaleString() || '0';
    };

    // Loading skeleton
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    {[...Array(8)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="text" width="80%" height={50} />
                                    <Skeleton variant="rectangular" width="100%" height={60} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                        borderRadius: 3
                    }}
                >
                    <AnalyticsIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom color="error">
                        Analytics Unavailable
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={refreshAnalytics}
                        sx={{
                            background: chartColors.gradient,
                            '&:hover': {
                                background: chartColors.gradient,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Try Again
                    </Button>
                </Paper>
            </Container>
        );
    }

    const { overview, growth, topMemes, categoryStats, dailyActivity } = analyticsData || {};

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            py: { xs: 1, sm: 2, md: 3 },
            px: 0,
            width: '100%',
            maxWidth: '100vw',
            overflow: 'hidden',
            overflowX: 'hidden'
        }}>
            <Container 
                maxWidth="xl" 
                disableGutters
                sx={{ 
                    px: { xs: 1, sm: 2, md: 3, lg: 4 },
                    maxWidth: '100%',
                    overflow: 'hidden',
                    width: '100%'
                }}
            >
                {/* Header */}
                <Fade in={true} timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            mb: { xs: 2, sm: 3, md: 4 },
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: { xs: 2, sm: 3, md: 4 },
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: chartColors.gradient,
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 1, md: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0, flex: 1, width: '100%' }}>
                                <Avatar
                                    sx={{
                                        background: chartColors.gradient,
                                        width: { xs: 40, sm: 48, md: 56 },
                                        height: { xs: 40, sm: 48, md: 56 },
                                        flexShrink: 0
                                    }}
                                >
                                    <AnalyticsIcon sx={{ fontSize: { xs: 20, sm: 24, md: 32 } }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                                        fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' },
                                        lineHeight: 1.2
                                    }}>
                                        Analytics Dashboard
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                        display: { xs: 'none', sm: 'block' }
                                    }}>
                                        Track your meme performance and audience engagement
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                                <ButtonGroup 
                                    variant="outlined" 
                                    size="small"
                                    orientation={isMobile ? 'vertical' : 'horizontal'}
                                    sx={{ 
                                        '& .MuiButton-root': { 
                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                            px: { xs: 1, sm: 2 }
                                        }
                                    }}
                                >
                                    {timeRangeOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            onClick={() => handleTimeRangeChange(option.value)}
                                            variant={timeRange === option.value ? 'contained' : 'outlined'}
                                            sx={{
                                                ...(timeRange === option.value && {
                                                    background: chartColors.gradient,
                                                    border: 'none'
                                                })
                                            }}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                                
                                <IconButton
                                    onClick={refreshAnalytics}
                                    disabled={refreshing}
                                    sx={{
                                        background: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                            background: alpha(theme.palette.primary.main, 0.2),
                                            transform: 'rotate(180deg)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <RefreshIcon sx={{ 
                                        ...(refreshing && {
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '100%': { transform: 'rotate(360deg)' }
                                            }
                                        })
                                    }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                {/* Overview Stats Cards */}
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                    {[
                        { 
                            title: 'Total Memes', 
                            value: overview?.totalMemes || 0, 
                            icon: <AnalyticsIcon />, 
                            color: chartColors.primary,
                            growth: growth?.memesGrowth,
                            suffix: ''
                        },
                        { 
                            title: 'Total Views', 
                            value: overview?.totalViews || 0, 
                            icon: <ViewsIcon />, 
                            color: chartColors.info,
                            growth: null,
                            suffix: ''
                        },
                        { 
                            title: 'Total Likes', 
                            value: overview?.totalLikes || 0, 
                            icon: <LikesIcon />, 
                            color: chartColors.success,
                            growth: null,
                            suffix: ''
                        },
                        { 
                            title: 'Total Shares', 
                            value: overview?.totalShares || 0, 
                            icon: <ShareIcon />, 
                            color: chartColors.accent,
                            growth: null,
                            suffix: ''
                        },
                        { 
                            title: 'Downloads', 
                            value: overview?.totalDownloads || 0, 
                            icon: <DownloadIcon />, 
                            color: chartColors.warning,
                            growth: null,
                            suffix: ''
                        },
                        { 
                            title: 'Comments', 
                            value: overview?.totalComments || 0, 
                            icon: <CommentIcon />, 
                            color: chartColors.secondary,
                            growth: null,
                            suffix: ''
                        },
                        { 
                            title: 'Followers', 
                            value: overview?.followersCount || 0, 
                            icon: <FollowersIcon />, 
                            color: chartColors.primary,
                            growth: growth?.followersGrowth,
                            suffix: ''
                        },
                        { 
                            title: 'Engagement Rate', 
                            value: overview?.avgEngagement || 0, 
                            icon: <EngagementIcon />, 
                            color: chartColors.success,
                            growth: null,
                            suffix: '%'
                        }
                    ].map((stat, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={3} xl={3} key={index}>
                            <Zoom in={true} timeout={600 + index * 100}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        background: theme.palette.mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 12px 40px ${alpha(stat.color, 0.3)}`,
                                            border: `1px solid ${alpha(stat.color, 0.4)}`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    backgroundColor: alpha(stat.color, 0.1),
                                                    color: stat.color,
                                                    width: { xs: 36, sm: 40, md: 48 },
                                                    height: { xs: 36, sm: 40, md: 48 }
                                                }}
                                            >
                                                {stat.icon}
                                            </Avatar>
                                            {stat.growth !== null && stat.growth !== undefined && (
                                                <Chip
                                                    icon={getTrendIcon(stat.growth)}
                                                    label={`${stat.growth >= 0 ? '+' : ''}${stat.growth.toFixed(1)}%`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: stat.growth >= 0 
                                                            ? alpha(chartColors.success, 0.1)
                                                            : alpha('#ef4444', 0.1),
                                                        color: stat.growth >= 0 ? chartColors.success : '#ef4444',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        
                                        <Typography variant="h4" component="div" fontWeight="bold" color={stat.color} sx={{
                                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
                                        }}>
                                            {formatNumber(stat.value)}{stat.suffix}
                                        </Typography>
                                        
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
                                        }}>
                                            {stat.title}
                                        </Typography>
                                        
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min((stat.value / Math.max(...[
                                                overview?.totalMemes || 0,
                                                overview?.totalViews || 0,
                                                overview?.totalLikes || 0,
                                                overview?.totalShares || 0,
                                                overview?.totalDownloads || 0,
                                                overview?.totalComments || 0,
                                                overview?.followersCount || 0,
                                                overview?.avgEngagement || 0
                                            ])) * 100, 100)}
                                            sx={{
                                                mt: 2,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: alpha(stat.color, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: stat.color,
                                                    borderRadius: 3
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Daily Activity Chart */}
                    <Grid item xs={12} lg={8}>
                        <Fade in={true} timeout={1000}>
                            <Card
                                sx={{
                                    height: { xs: 280, sm: 320, md: 380, lg: 400 },
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    borderRadius: { xs: 2, sm: 3 }
                                }}
                            >
                                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                                        <TimelineIcon sx={{ mr: 2, color: chartColors.primary }} />
                                        <Typography variant="h6" fontWeight="bold" sx={{
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                                        }}>
                                            Daily Activity
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ width: '100%', height: { xs: '220px', sm: '260px', md: '300px', lg: '320px' } }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart 
                                            data={dailyActivity || []}
                                            margin={{
                                                top: 5,
                                                right: isMobile ? 5 : 30,
                                                left: isMobile ? 5 : 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                                                </linearGradient>
                                                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                                            <XAxis 
                                                dataKey="_id" 
                                                stroke={theme.palette.text.secondary}
                                                fontSize={isMobile ? 10 : 12}
                                                interval={isMobile ? 'preserveStartEnd' : 0}
                                            />
                                            <YAxis 
                                                stroke={theme.palette.text.secondary} 
                                                fontSize={isMobile ? 10 : 12}
                                                width={isMobile ? 30 : 60}
                                            />
                                            <RechartsTooltip 
                                                contentStyle={{
                                                    backgroundColor: theme.palette.background.paper,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    borderRadius: '8px',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="totalViews" 
                                                stroke={chartColors.primary} 
                                                fillOpacity={1} 
                                                fill="url(#colorViews)"
                                                name="Views"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="totalLikes" 
                                                stroke={chartColors.success} 
                                                fillOpacity={1} 
                                                fill="url(#colorLikes)"
                                                name="Likes"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>

                    {/* Category Breakdown */}
                    <Grid item xs={12} lg={4}>
                        <Fade in={true} timeout={1200}>
                            <Card
                                sx={{
                                    height: { xs: 280, sm: 320, md: 380, lg: 400 },
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    borderRadius: { xs: 2, sm: 3 }
                                }}
                            >
                                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                                        <CategoryIcon sx={{ mr: 2, color: chartColors.secondary }} />
                                        <Typography variant="h6" fontWeight="bold" sx={{
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                                        }}>
                                            Category Breakdown
                                        </Typography>
                                    </Box>

                                    {categoryStats && categoryStats.length > 0 ? (
                                        <Box sx={{ width: '100%', height: { xs: '200px', sm: '240px', md: '280px', lg: '300px' } }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                            <PieChart 
                                                margin={{
                                                    top: 5,
                                                    right: 5,
                                                    left: 5,
                                                    bottom: 5,
                                                }}
                                            >
                                                <Pie
                                                    data={categoryStats.map((cat, index) => ({
                                                        name: cat._id || 'Uncategorized',
                                                        value: cat.count,
                                                        color: [
                                                            chartColors.primary,
                                                            chartColors.secondary,
                                                            chartColors.accent,
                                                            chartColors.success,
                                                            chartColors.warning,
                                                            chartColors.info
                                                        ][index % 6]
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={isMobile ? 50 : isSmallTablet ? 60 : 80}
                                                    dataKey="value"
                                                    label={({ name, percent }) => 
                                                        isMobile ? `${(percent * 100).toFixed(0)}%` :
                                                        `${name} (${(percent * 100).toFixed(0)}%)`
                                                    }
                                                >
                                                    {categoryStats.map((_, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={[
                                                                chartColors.primary,
                                                                chartColors.secondary,
                                                                chartColors.accent,
                                                                chartColors.success,
                                                                chartColors.warning,
                                                                chartColors.info
                                                            ][index % 6]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            height: { xs: '200px', sm: '240px', md: '280px', lg: '300px' },
                                            color: 'text.secondary'
                                        }}>
                                            <Typography>No category data available</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                </Grid>

                {/* Top Performing Memes */}
                <Fade in={true} timeout={1400}>
                    <Card
                        sx={{
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderRadius: { xs: 2, sm: 3 }
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                                <TrophyIcon sx={{ mr: 2, color: chartColors.warning }} />
                                <Typography variant="h6" fontWeight="bold" sx={{
                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                                }}>
                                    Top Performing Memes
                                </Typography>
                            </Box>

                            {topMemes && topMemes.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {topMemes.map((meme, index) => (
                                        <ListItem
                                            key={meme._id}
                                            sx={{
                                                mb: { xs: 1, sm: 2 },
                                                background: alpha(theme.palette.background.paper, 0.5),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={meme.imageUrl}
                                                    sx={{
                                                        width: { xs: 40, sm: 48, md: 56 },
                                                        height: { xs: 40, sm: 48, md: 56 },
                                                        border: `2px solid ${chartColors.primary}`
                                                    }}
                                                >
                                                    <StarIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{
                                                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                                                        }}>
                                                            {meme.title || 'Untitled Meme'}
                                                        </Typography>
                                                        <Chip
                                                            label={`#${index + 1}`}
                                                            size="small"
                                                            sx={{
                                                                background: index === 0 ? '#ffd700' : 
                                                                           index === 1 ? '#c0c0c0' : '#cd7f32',
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1, md: 2 }, flexWrap: 'wrap', mb: 1 }}>
                                                            <Chip
                                                                icon={<LikesIcon />}
                                                                label={formatNumber(meme.stats?.likesCount || 0)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ color: chartColors.success }}
                                                            />
                                                            <Chip
                                                                icon={<ViewsIcon />}
                                                                label={formatNumber(meme.stats?.views || 0)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ color: chartColors.info }}
                                                            />
                                                            <Chip
                                                                icon={<ShareIcon />}
                                                                label={formatNumber(meme.stats?.shares || 0)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ color: chartColors.accent }}
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Created: {new Date(meme.createdAt).toLocaleDateString()}
                                                            {meme.category && (
                                                                <Chip
                                                                    label={meme.category}
                                                                    size="small"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    py: 4,
                                    color: 'text.secondary'
                                }}>
                                    <TrophyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                    <Typography variant="h6">No memes yet</Typography>
                                    <Typography variant="body2">
                                        Create your first meme to see analytics!
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        </Box>
    );
};

export default AnalyticsDashboard;
