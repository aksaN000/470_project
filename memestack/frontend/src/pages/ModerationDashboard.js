import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Box,
    Tab,
    Tabs,
    CircularProgress,
    Fade,
    Zoom,
    useTheme,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    Gavel as BanIcon,
    CheckCircle as ResolveIcon,
    Cancel as DismissIcon
} from '@mui/icons-material';
import {
    getReports,
    getModerationDashboard,
    reviewReport,
    dismissReport,
    warnUser,
    suspendUser,
    banUser
} from '../services/moderationAPI';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const ModerationDashboard = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { mode } = useThemeMode() || { mode: 'light' };
    const [activeTab, setActiveTab] = useState(0);
    const [reports, setReports] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [actionDialog, setActionDialog] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionReason, setActionReason] = useState('');
    const [suspensionDays, setSuspensionDays] = useState(7);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user && user.role === 'admin') {
            loadDashboardData();
            loadReports();
        }
    }, [user]);

    // Check if user is admin
    if (!user || user.role !== 'admin') {
        return (
            <Container>
                <Alert severity="error">
                    Access denied. Admin privileges required.
                </Alert>
            </Container>
        );
    }

    const loadDashboardData = async () => {
        try {
            const stats = await getModerationDashboard();
            setDashboardStats(stats);
        } catch (err) {
            setError('Failed to load dashboard stats');
        }
    };

    const loadReports = async (status = '') => {
        try {
            setLoading(true);
            const filters = status ? { status } : {};
            const data = await getReports(filters);
            setReports(data.reports || []);
        } catch (err) {
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        const statuses = ['', 'pending', 'under_review', 'resolved'];
        loadReports(statuses[newValue]);
    };

    const handleActionClick = (report, action) => {
        setSelectedReport(report);
        setActionType(action);
        setActionDialog(true);
        setActionReason('');
    };

    const handleActionSubmit = async () => {
        if (!selectedReport || !actionType) return;

        try {
            setError('');
            let result;

            switch (actionType) {
                case 'warn':
                    result = await warnUser(
                        selectedReport.reportedUser._id,
                        actionReason,
                        selectedReport._id
                    );
                    break;
                case 'suspend':
                    result = await suspendUser(
                        selectedReport.reportedUser._id,
                        actionReason,
                        suspensionDays,
                        selectedReport._id
                    );
                    break;
                case 'ban':
                    result = await banUser(
                        selectedReport.reportedUser._id,
                        actionReason,
                        selectedReport._id
                    );
                    break;
                case 'resolve':
                    result = await reviewReport(selectedReport._id, 'resolved', actionReason);
                    break;
                case 'dismiss':
                    result = await dismissReport(selectedReport._id, actionReason);
                    break;
                default:
                    throw new Error('Invalid action type');
            }

            setSuccess(`Action completed successfully: ${result.message}`);
            setActionDialog(false);
            loadReports();
            loadDashboardData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to perform action');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'under_review': return 'info';
            case 'resolved': return 'success';
            case 'dismissed': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            py: 4
        }}>
            <Fade in timeout={800}>
                <Container maxWidth="xl">
                    <Paper
                        elevation={0}
                        sx={{
                            background: mode === 'dark' 
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                            backdropFilter: 'blur(50px)',
                            borderRadius: 3,
                            border: mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.15)'
                                : '2px solid rgba(99, 102, 241, 0.15)',
                            borderTop: mode === 'dark'
                                ? '3px solid rgba(255, 255, 255, 0.25)'
                                : '3px solid rgba(99, 102, 241, 0.25)',
                            boxShadow: mode === 'dark'
                                ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                : '0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                            p: { xs: 2, md: 4 }
                        }}
                    >
            <Typography variant="h4" gutterBottom>
                Moderation Dashboard
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

            {/* Dashboard Stats */}
            {dashboardStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Reports"
                            value={dashboardStats.totalReports}
                            color="primary"
                            variant="compact"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Reports"
                            value={dashboardStats.pendingReports}
                            color="warning"
                            variant="compact"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Resolved Today"
                            value={dashboardStats.resolvedToday}
                            color="success"
                            variant="compact"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Active Moderators"
                            value={dashboardStats.activeModerators}
                            color="info"
                            variant="compact"
                        />
                    </Grid>
                </Grid>
            )}

            {/* Reports Table */}
            <Card
                sx={{
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
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="All Reports" />
                        <Tab label="Pending" />
                        <Tab label="Under Review" />
                        <Tab label="Resolved" />
                    </Tabs>
                </Box>

                <TableContainer>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Content</TableCell>
                                    <TableCell>Reporter</TableCell>
                                    <TableCell>Reported User</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report._id}>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {report.contentType}
                                            </Typography>
                                            {report.contentId && (
                                                <Typography variant="caption" color="textSecondary">
                                                    ID: {report.contentId.slice(-8)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {report.reporter?.username || 'Anonymous'}
                                        </TableCell>
                                        <TableCell>
                                            {report.reportedUser?.username || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {report.reason}
                                            </Typography>
                                            {report.description && (
                                                <Typography variant="caption" color="textSecondary">
                                                    {report.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={report.priority}
                                                size="small"
                                                sx={{
                                                    background: mode === 'dark'
                                                        ? getPriorityColor(report.priority) === 'error' 
                                                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)'
                                                            : getPriorityColor(report.priority) === 'warning'
                                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)'
                                                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                                                        : getPriorityColor(report.priority) === 'error' 
                                                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
                                                            : getPriorityColor(report.priority) === 'warning'
                                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)'
                                                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: mode === 'dark'
                                                        ? '1px solid rgba(255, 255, 255, 0.15)'
                                                        : '1px solid rgba(255, 255, 255, 0.3)',
                                                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={report.status.replace('_', ' ')}
                                                size="small"
                                                sx={{
                                                    background: mode === 'dark'
                                                        ? getStatusColor(report.status) === 'success' 
                                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)'
                                                            : getStatusColor(report.status) === 'warning'
                                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)'
                                                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                                                        : getStatusColor(report.status) === 'success' 
                                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
                                                            : getStatusColor(report.status) === 'warning'
                                                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)'
                                                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: mode === 'dark'
                                                        ? '1px solid rgba(255, 255, 255, 0.15)'
                                                        : '1px solid rgba(255, 255, 255, 0.3)',
                                                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(report.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            {report.status === 'pending' || report.status === 'under_review' ? (
                                                <Box>
                                                    <Tooltip title="Issue Warning">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleActionClick(report, 'warn')}
                                                            color="warning"
                                                        >
                                                            <WarningIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Suspend User">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleActionClick(report, 'suspend')}
                                                            color="info"
                                                        >
                                                            <BlockIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ban User">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleActionClick(report, 'ban')}
                                                            color="error"
                                                        >
                                                            <BanIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Resolve Report">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleActionClick(report, 'resolve')}
                                                            color="success"
                                                        >
                                                            <ResolveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Dismiss Report">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleActionClick(report, 'dismiss')}
                                                        >
                                                            <DismissIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">
                                                    {report.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Card>

            {/* Action Dialog */}
            <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionType === 'warn' && 'Issue Warning'}
                    {actionType === 'suspend' && 'Suspend User'}
                    {actionType === 'ban' && 'Ban User'}
                    {actionType === 'resolve' && 'Resolve Report'}
                    {actionType === 'dismiss' && 'Dismiss Report'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason"
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        margin="normal"
                        required
                    />
                    {actionType === 'suspend' && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Suspension Duration (days)</InputLabel>
                            <Select
                                value={suspensionDays}
                                label="Suspension Duration (days)"
                                onChange={(e) => setSuspensionDays(e.target.value)}
                            >
                                <MenuItem value={1}>1 day</MenuItem>
                                <MenuItem value={3}>3 days</MenuItem>
                                <MenuItem value={7}>7 days</MenuItem>
                                <MenuItem value={14}>14 days</MenuItem>
                                <MenuItem value={30}>30 days</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleActionSubmit}
                        variant="contained"
                        disabled={!actionReason.trim()}
                        color={actionType === 'ban' ? 'error' : 'primary'}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
                    </Paper>
                </Container>
            </Fade>
        </Box>
    );
};

export default ModerationDashboard;
