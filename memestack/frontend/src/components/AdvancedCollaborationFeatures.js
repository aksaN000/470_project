// 🚀 Advanced Collaboration Features Component
// Template selection, fork management, activity tracking, and insights

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    LinearProgress,
    Alert,
    Tab,
    Tabs,
    TabPanel,
    Divider,
    CircularProgress,
    Rating,
    Stepper,
    Step,
    StepLabel,
    Switch,
    FormControlLabel,
    TextField,
    MenuItem
} from '@mui/material';
import {
    Assignment as TemplateIcon,
    Insights as InsightsIcon,
    Timeline as ActivityIcon,
    Merge as MergeIcon,
    Analytics as StatsIcon,
    Star as StarIcon,
    CheckCircle as CompleteIcon,
    Pending as PendingIcon,
    TrendingUp as TrendingIcon,
    Group as GroupIcon,
    Speed as SpeedIcon,
    School as TutorialIcon
} from '@mui/icons-material';
import { collaborationsAPI } from '../services/api';

const AdvancedCollaborationFeatures = ({ collaborationId, user, onRefresh }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [templates, setTemplates] = useState([]);
    const [insights, setInsights] = useState(null);
    const [activity, setActivity] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Dialog states
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forkToMerge, setForkToMerge] = useState('');
    const [mergeOptions, setMergeOptions] = useState({
        mergeVersions: true,
        mergeComments: false,
        mergeCollaborators: false
    });

    useEffect(() => {
        if (collaborationId) {
            loadAdvancedData();
        }
    }, [collaborationId]);

    const loadAdvancedData = async () => {
        setLoading(true);
        try {
            const [templatesRes, insightsRes, activityRes, statsRes] = await Promise.allSettled([
                collaborationsAPI.getTemplates(),
                collaborationsAPI.getInsights(collaborationId),
                collaborationsAPI.getActivity(collaborationId),
                collaborationsAPI.getStats(collaborationId)
            ]);

            if (templatesRes.status === 'fulfilled') setTemplates(templatesRes.value);
            if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
            if (activityRes.status === 'fulfilled') setActivity(activityRes.value.activities || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
        } catch (error) {
            setError('Failed to load advanced features');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFromTemplate = async (templateId, title, description) => {
        try {
            setLoading(true);
            await collaborationsAPI.createFromTemplate({ templateId, title, description });
            setSuccess('Collaboration created from template successfully!');
            setTemplateDialogOpen(false);
            onRefresh && onRefresh();
        } catch (error) {
            setError(error.message || 'Failed to create from template');
        } finally {
            setLoading(false);
        }
    };

    const handleMergeFork = async () => {
        try {
            setLoading(true);
            await collaborationsAPI.mergeFork(collaborationId, forkToMerge, mergeOptions);
            setSuccess('Fork merged successfully!');
            setMergeDialogOpen(false);
            setForkToMerge('');
            onRefresh && onRefresh();
            loadAdvancedData();
        } catch (error) {
            setError(error.message || 'Failed to merge fork');
        } finally {
            setLoading(false);
        }
    };

    const getTemplateIcon = (category) => {
        switch (category) {
            case 'meme-remix': return <StarIcon />;
            case 'group-project': return <GroupIcon />;
            case 'tutorial': return <TutorialIcon />;
            case 'quick': return <SpeedIcon />;
            default: return <TemplateIcon />;
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'version_created': return <CompleteIcon color="success" />;
            case 'comment_added': return <PendingIcon color="info" />;
            case 'user_joined': return <GroupIcon color="primary" />;
            default: return <ActivityIcon />;
        }
    };

    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Advanced Collaboration Tools
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab icon={<InsightsIcon />} label="Insights" />
                    <Tab icon={<ActivityIcon />} label="Activity" />
                    <Tab icon={<StatsIcon />} label="Statistics" />
                    <Tab icon={<TemplateIcon />} label="Templates" />
                    <Tab icon={<MergeIcon />} label="Merge" />
                </Tabs>

                {/* Insights Tab */}
                <TabPanel value={activeTab} index={0}>
                    {insights ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            Engagement Score
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Rating 
                                                value={insights.overview?.engagementRate ? Math.min(5, insights.overview.engagementRate / 20) : 2.5} 
                                                max={5} 
                                                readOnly 
                                                size="small"
                                            />
                                            <Typography variant="body2">
                                                {insights.overview?.engagementRate ? (insights.overview.engagementRate / 20).toFixed(1) : '2.5'}/5
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {insights.overview?.engagementRate?.toFixed(1) || '50'}% engagement rate
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" color="success.main" gutterBottom>
                                            Quality Score
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={insights.performance?.completionRate || 0} 
                                            color="success"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2">
                                            {insights.performance?.completionRate?.toFixed(0) || 0}% Complete
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {insights.participants?.retentionRate?.toFixed(0) || 0}% retention rate
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" color="warning.main" gutterBottom>
                                            Activity Status
                                        </Typography>
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            {insights.activity?.activityTrend > 50 && <Chip label="🔥 Hot" color="error" size="small" />}
                                            {insights.activity?.activityTrend > 25 && <Chip label="📈 Trending" color="warning" size="small" />}
                                            {insights.activity?.recentActivity < 3 && <Chip label="⚠️ Needs Attention" color="default" size="small" />}
                                            {insights.performance?.qualityScore > 4 && <Chip label="✅ Successful" color="success" size="small" />}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    <Typography variant="subtitle2" gutterBottom>
                                        💡 Performance Summary
                                    </Typography>
                                    <List dense>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemText primary={`${insights.overview?.totalParticipants || 0} total participants`} />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemText primary={`${insights.overview?.activeParticipants || 0} active this week`} />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemText primary={`${insights.activity?.avgResponseTime || 0} min avg response time`} />
                                        </ListItem>
                                        <ListItem sx={{ pl: 0 }}>
                                            <ListItemText primary={`Quality Score: ${insights.performance?.qualityScore?.toFixed(1) || 'N/A'}/5`} />
                                        </ListItem>
                                    </List>
                                </Alert>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography>No insights available</Typography>
                    )}
                </TabPanel>

                {/* Activity Tab */}
                <TabPanel value={activeTab} index={1}>
                    <List>
                        {activity.map((item, index) => (
                            <ListItem key={index} divider>
                                <ListItemIcon>
                                    {getActivityIcon(item.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2">
                                                {item.user?.username || 'Unknown user'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.type.replace('_', ' ')}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </Typography>
                                            {item.details && (
                                                <Typography variant="caption" display="block">
                                                    {item.details.title || item.details.content || `Role: ${item.details.role}`}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>

                {/* Statistics Tab */}
                <TabPanel value={activeTab} index={2}>
                    {stats && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Basic Metrics</Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Total Versions" 
                                            secondary={stats.basic.totalVersions} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Total Comments" 
                                            secondary={stats.basic.totalComments} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Total Contributors" 
                                            secondary={stats.basic.totalContributors} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Total Views" 
                                            secondary={stats.basic.totalViews} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Total Forks" 
                                            secondary={stats.basic.totalForks} 
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Activity Metrics</Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Versions per Collaborator" 
                                            secondary={stats.activity.averageVersionsPerCollaborator.toFixed(2)} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Comments per Version" 
                                            secondary={stats.activity.commentsPerVersion.toFixed(2)} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Activity Score" 
                                            secondary={stats.activity.activityScore} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Days Since Creation" 
                                            secondary={stats.timeline.daysSinceCreation} 
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>

                {/* Templates Tab */}
                <TabPanel value={activeTab} index={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Collaboration Templates</Typography>
                        <Button 
                            variant="outlined" 
                            onClick={() => setTemplateDialogOpen(true)}
                            startIcon={<TemplateIcon />}
                        >
                            Use Template
                        </Button>
                    </Box>
                    
                    <Grid container spacing={2}>
                        {templates.map((template, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            {getTemplateIcon(template.category)}
                                            <Typography variant="h6" noWrap>
                                                {template.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {template.description}
                                        </Typography>
                                        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                            <Chip label={template.category} size="small" />
                                            {template.tags.slice(0, 2).map(tag => (
                                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Max: {template.settings?.maxCollaborators || template.maxParticipants} collaborators
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </TabPanel>

                {/* Merge Tab */}
                <TabPanel value={activeTab} index={4}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Merge Fork
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Merge enhancements from a fork back into this collaboration.
                        </Typography>
                        
                        <Button 
                            variant="contained" 
                            onClick={() => setMergeDialogOpen(true)}
                            startIcon={<MergeIcon />}
                            sx={{ mb: 2 }}
                        >
                            Start Merge Process
                        </Button>
                        
                        <Alert severity="info">
                            <Typography variant="body2">
                                Only owners and admins can merge forks. The merge process allows you to 
                                incorporate versions, comments, and collaborators from a fork into the parent collaboration.
                            </Typography>
                        </Alert>
                    </Box>
                </TabPanel>
            </CardContent>

            {/* Template Selection Dialog */}
            <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create from Template</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {templates.map((template, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card 
                                    variant={selectedTemplate?.name === template.name ? "elevation" : "outlined"}
                                    sx={{ 
                                        cursor: 'pointer',
                                        border: selectedTemplate?.name === template.name ? 2 : 1,
                                        borderColor: selectedTemplate?.name === template.name ? 'primary.main' : 'grey.300'
                                    }}
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            {getTemplateIcon(template.category)}
                                            <Typography variant="h6">{template.name}</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {template.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        disabled={!selectedTemplate}
                        onClick={() => {
                            // This would open another dialog for title/description
                            // For now, just use template name
                            handleCreateFromTemplate(
                                selectedTemplate._id,
                                `New ${selectedTemplate.name}`,
                                selectedTemplate.description
                            );
                        }}
                    >
                        Create Collaboration
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Merge Fork Dialog */}
            <Dialog open={mergeDialogOpen} onClose={() => setMergeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Merge Fork</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Fork ID"
                        value={forkToMerge}
                        onChange={(e) => setForkToMerge(e.target.value)}
                        margin="normal"
                        helperText="Enter the ID of the fork you want to merge"
                    />
                    
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Merge Options
                    </Typography>
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mergeOptions.mergeVersions}
                                onChange={(e) => setMergeOptions(prev => ({
                                    ...prev,
                                    mergeVersions: e.target.checked
                                }))}
                            />
                        }
                        label="Merge Versions"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mergeOptions.mergeComments}
                                onChange={(e) => setMergeOptions(prev => ({
                                    ...prev,
                                    mergeComments: e.target.checked
                                }))}
                            />
                        }
                        label="Merge Comments"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mergeOptions.mergeCollaborators}
                                onChange={(e) => setMergeOptions(prev => ({
                                    ...prev,
                                    mergeCollaborators: e.target.checked
                                }))}
                            />
                        }
                        label="Merge Collaborators"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleMergeFork}
                        disabled={!forkToMerge.trim()}
                    >
                        Merge Fork
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default AdvancedCollaborationFeatures;
