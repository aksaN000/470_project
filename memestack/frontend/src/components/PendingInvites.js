// 🔔 Pending Invites Component
// Displays and manages collaboration invites for users

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Check as AcceptIcon,
    Close as DeclineIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { collaborationsAPI } from '../services/api';

const PendingInvites = ({ open, onClose }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (open) {
            loadInvites();
        }
    }, [open]);

    const loadInvites = async () => {
        try {
            setLoading(true);
            const data = await collaborationsAPI.getPendingInvites();
            setInvites(data);
        } catch (error) {
            setError(error.message || 'Failed to load invites');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async (collaborationId) => {
        try {
            setSubmitting(true);
            await collaborationsAPI.acceptInvite(collaborationId);
            setSuccess('Invite accepted successfully!');
            loadInvites(); // Refresh the list
        } catch (error) {
            setError(error.message || 'Failed to accept invite');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeclineInvite = async (collaborationId) => {
        try {
            setSubmitting(true);
            await collaborationsAPI.declineInvite(collaborationId);
            setSuccess('Invite declined successfully!');
            loadInvites(); // Refresh the list
        } catch (error) {
            setError(error.message || 'Failed to decline invite');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon />
                    Collaboration Invites
                </Box>
            </DialogTitle>
            <DialogContent>
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

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : invites.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No pending invites
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You'll see collaboration invites here when someone invites you to join their project.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {invites.map((invite) => (
                            <Grid item xs={12} key={invite.collaboration._id}>
                                <Card sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Avatar 
                                                src={invite.collaboration.owner?.profile?.avatar}
                                                sx={{ mr: 2 }}
                                            >
                                                {invite.collaboration.owner?.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6">
                                                    {invite.collaboration.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    by {invite.collaboration.owner?.profile?.displayName || invite.collaboration.owner?.username}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={`${invite.invite.role} role`} 
                                                color="primary" 
                                                size="small" 
                                            />
                                        </Box>

                                        {invite.collaboration.description && (
                                            <Typography variant="body2" paragraph>
                                                {invite.collaboration.description}
                                            </Typography>
                                        )}

                                        {invite.invite.message && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>Personal Message:</strong> "{invite.invite.message}"
                                                </Typography>
                                            </Alert>
                                        )}

                                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                            Invited by {invite.invite.invitedBy?.profile?.displayName || invite.invite.invitedBy?.username} • {new Date(invite.invite.invitedAt).toLocaleDateString()}
                                        </Typography>

                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="contained"
                                                startIcon={<AcceptIcon />}
                                                onClick={() => handleAcceptInvite(invite.collaboration._id)}
                                                disabled={submitting}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                                                    }
                                                }}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DeclineIcon />}
                                                onClick={() => handleDeclineInvite(invite.collaboration._id)}
                                                disabled={submitting}
                                                color="error"
                                            >
                                                Decline
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PendingInvites;
