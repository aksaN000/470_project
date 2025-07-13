import React, { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Tooltip
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Flag as FlagIcon
} from '@mui/icons-material';
import { submitReport } from '../../services/moderationAPI';
import { useAuth } from '../../contexts/AuthContext';

const ReportButton = ({ 
    contentType, 
    contentId, 
    reportedUserId,
    size = 'small',
    variant = 'icon' // 'icon', 'button', 'menuItem'
}) => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const reportReasons = {
        meme: [
            'Inappropriate content',
            'Spam',
            'Copyright violation',
            'Hate speech',
            'Violence or harassment',
            'False information',
            'Other'
        ],
        comment: [
            'Spam',
            'Hate speech',
            'Harassment',
            'Inappropriate content',
            'Off-topic',
            'False information',
            'Other'
        ],
        user: [
            'Harassment',
            'Spam account',
            'Impersonation',
            'Hate speech',
            'Inappropriate profile',
            'Bot account',
            'Other'
        ]
    };

    const handleClick = (event) => {
        if (variant === 'menuItem') {
            setDialogOpen(true);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleReportClick = () => {
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setReportReason('');
        setCustomReason('');
        setError('');
        setSuccess(false);
    };

    const handleSubmitReport = async () => {
        if (!reportReason) {
            setError('Please select a reason for reporting');
            return;
        }

        if (reportReason === 'Other' && !customReason.trim()) {
            setError('Please provide a custom reason');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const finalReason = reportReason === 'Other' ? customReason : reportReason;
            
            await submitReport({
                contentType,
                contentId,
                reportedUserId,
                reason: finalReason,
                description: reportReason === 'Other' ? '' : customReason
            });

            setSuccess(true);
            setTimeout(() => {
                handleDialogClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return null; // Don't show report button to unauthenticated users
    }

    const renderTrigger = () => {
        switch (variant) {
            case 'button':
                return (
                    <Button
                        startIcon={<FlagIcon />}
                        onClick={handleClick}
                        size={size}
                        color="inherit"
                    >
                        Report
                    </Button>
                );
            case 'menuItem':
                return (
                    <MenuItem onClick={handleClick}>
                        <FlagIcon sx={{ mr: 1 }} />
                        Report
                    </MenuItem>
                );
            default:
                return (
                    <Tooltip title="Report content">
                        <IconButton
                            onClick={handleClick}
                            size={size}
                            color="inherit"
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                );
        }
    };

    return (
        <>
            {renderTrigger()}
            
            {variant !== 'menuItem' && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleReportClick}>
                        <FlagIcon sx={{ mr: 1 }} />
                        Report
                    </MenuItem>
                </Menu>
            )}

            <Dialog 
                open={dialogOpen} 
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Report {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </DialogTitle>
                <DialogContent>
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Report submitted successfully. Our moderation team will review it.
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Reason for reporting</InputLabel>
                        <Select
                            value={reportReason}
                            label="Reason for reporting"
                            onChange={(e) => setReportReason(e.target.value)}
                            disabled={submitting || success}
                        >
                            {reportReasons[contentType]?.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                    {reason}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {reportReason === 'Other' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Please specify"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            margin="normal"
                            disabled={submitting || success}
                            required
                        />
                    )}

                    {reportReason && reportReason !== 'Other' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Additional details (optional)"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            margin="normal"
                            disabled={submitting || success}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleDialogClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitReport}
                        variant="contained"
                        disabled={submitting || success || !reportReason}
                        color="error"
                    >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReportButton;
