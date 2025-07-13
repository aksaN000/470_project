// 💬 Comment Section Component
// Interactive comment system for memes

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Reply as ReplyIcon,
    MoreVert as MoreVertIcon,
    Report as ReportIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { commentsAPI } from '../../services/api';

const CommentSection = ({ memeId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [reportDialog, setReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load comments when component mounts
    useEffect(() => {
        loadComments();
    }, [memeId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await commentsAPI.getComments(memeId);
            if (response.success) {
                setComments(response.data.comments);
            } else {
                throw new Error(response.message || 'Failed to load comments');
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            setError('Failed to load comments. Please try again.');
            setComments([]); // Clear comments on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!isAuthenticated) {
            setError('Please log in to add comments');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            const response = await commentsAPI.addComment(memeId, {
                content: newComment.trim()
            });
            
            if (response.success) {
                setNewComment('');
                setSuccess('Comment added successfully!');
                setTimeout(() => setSuccess(''), 3000);
                loadComments(); // Reload comments to get updated list
            } else {
                throw new Error(response.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setError(error.message || 'Failed to add comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (commentId) => {
        if (!replyText.trim()) return;

        if (!isAuthenticated) {
            setError('Please log in to reply to comments');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            const response = await commentsAPI.addComment(memeId, {
                content: replyText.trim(),
                parentComment: commentId
            });
            
            if (response.success) {
                setReplyTo(null);
                setReplyText('');
                setSuccess('Reply added successfully!');
                setTimeout(() => setSuccess(''), 3000);
                loadComments(); // Reload comments to show new reply
            } else {
                throw new Error(response.message || 'Failed to add reply');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            setError(error.message || 'Failed to add reply. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        if (!isAuthenticated) {
            setError('Please log in to like comments');
            return;
        }

        try {
            const response = await commentsAPI.toggleLike(commentId);
            if (response.success) {
                // Update the comment in state
                setComments(comments.map(comment => 
                    comment.id === commentId 
                        ? { 
                            ...comment, 
                            isLiked: response.data.isLiked, 
                            stats: { 
                                ...comment.stats, 
                                likesCount: response.data.likesCount 
                            } 
                          }
                        : comment
                ));
            } else {
                throw new Error(response.message || 'Failed to update like');
            }
        } catch (error) {
            console.error('Error toggling comment like:', error);
            setError('Failed to update like. Please try again.');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editText.trim()) return;

        try {
            setSubmitting(true);
            setError('');
            
            const response = await commentsAPI.updateComment(commentId, {
                content: editText.trim()
            });
            
            if (response.success) {
                setEditingComment(null);
                setEditText('');
                setSuccess('Comment updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
                loadComments(); // Reload comments
            }
        } catch (error) {
            setError(error.message || 'Failed to update comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await commentsAPI.deleteComment(commentId);
            if (response.success) {
                setSuccess('Comment deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                loadComments(); // Reload comments
            }
        } catch (error) {
            setError(error.message || 'Failed to delete comment');
        }
    };

    const handleReportComment = async () => {
        if (!reportReason) return;

        try {
            const response = await commentsAPI.reportComment(selectedComment.id, {
                reason: reportReason,
                description: reportDescription
            });
            
            if (response.success) {
                setReportDialog(false);
                setReportReason('');
                setReportDescription('');
                setSelectedComment(null);
                setSuccess('Comment reported successfully. Thank you for helping keep our community safe.');
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (error) {
            setError(error.message || 'Failed to report comment');
        }
    };

    const openMenu = (event, comment) => {
        setMenuAnchor(event.currentTarget);
        setSelectedComment(comment);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedComment(null);
    };

    const startEdit = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.content);
        closeMenu();
    };

    const startReport = () => {
        setReportDialog(true);
        closeMenu();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                💬 Comments ({comments.length})
            </Typography>

            {/* Error/Success Messages */}
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

            {/* Add New Comment */}
            {isAuthenticated ? (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmitComment}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submitting}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    disabled={!newComment.trim() || submitting}
                                >
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center">
                            Please <Button onClick={() => window.location.href = '/login'} variant="text">log in</Button> to add comments
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    No comments yet. Be the first to comment!
                </Typography>
            ) : (
                <Box>
                    {comments.map((comment) => (
                        <Card key={comment.id} sx={{ mb: 2 }}>
                            <CardContent>
                                {/* Comment Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                        src={comment.author.profilePicture || comment.author.profile?.avatar}
                                        sx={{ width: 32, height: 32, mr: 2 }}
                                    >
                                        {comment.author.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {comment.author.username}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(comment.createdAt)}
                                        </Typography>
                                    </Box>
                                    {isAuthenticated && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => openMenu(e, comment)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                {/* Comment Content */}
                                {editingComment === comment.id ? (
                                    <Box>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleEditComment(comment.id)}
                                                disabled={!editText.trim() || submitting}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setEditingComment(null);
                                                    setEditText('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {comment.content}
                                    </Typography>
                                )}

                                {/* Comment Actions */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleLikeComment(comment.id)}
                                            disabled={!isAuthenticated}
                                            color={comment.isLiked ? 'error' : 'default'}
                                        >
                                            {comment.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                        <Typography variant="body2">
                                            {comment.stats.likesCount}
                                        </Typography>
                                    </Box>
                                    
                                    {isAuthenticated && (
                                        <Button
                                            size="small"
                                            startIcon={<ReplyIcon />}
                                            onClick={() => setReplyTo(comment.id)}
                                        >
                                            Reply
                                        </Button>
                                    )}

                                    {comment.stats.repliesCount > 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            {comment.stats.repliesCount} {comment.stats.repliesCount === 1 ? 'reply' : 'replies'}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Reply Form */}
                                {replyTo === comment.id && (
                                    <Box sx={{ mt: 2, pl: 4 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleSubmitReply(comment.id)}
                                                disabled={!replyText.trim() || submitting}
                                            >
                                                {submitting ? 'Posting...' : 'Reply'}
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setReplyTo(null);
                                                    setReplyText('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <Box sx={{ mt: 2, pl: 4 }}>
                                        <Divider sx={{ mb: 2 }} />
                                        {comment.replies.map((reply) => (
                                            <Box key={reply.id} sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar 
                                                        src={reply.author.profile?.avatar}
                                                        sx={{ width: 24, height: 24, mr: 1 }}
                                                    >
                                                        {reply.author.username.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                                                        {reply.author.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(reply.createdAt)}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">
                                                    {reply.content}
                                                </Typography>
                                            </Box>
                                        ))}
                                        {comment.hasMoreReplies && (
                                            <Button size="small" color="primary">
                                                View {comment.totalReplies - comment.replies.length} more replies
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
            >
                {selectedComment && user && selectedComment.author.id === user._id && (
                    <MenuItem onClick={() => startEdit(selectedComment)}>
                        <EditIcon sx={{ mr: 1 }} />
                        Edit
                    </MenuItem>
                )}
                {selectedComment && user && selectedComment.author.id === user._id && (
                    <MenuItem onClick={() => handleDeleteComment(selectedComment.id)}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete
                    </MenuItem>
                )}
                {selectedComment && user && selectedComment.author.id !== user._id && (
                    <MenuItem onClick={startReport}>
                        <ReportIcon sx={{ mr: 1 }} />
                        Report
                    </MenuItem>
                )}
            </Menu>

            {/* Report Dialog */}
            <Dialog open={reportDialog} onClose={() => setReportDialog(false)}>
                <DialogTitle>Report Comment</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Reason</InputLabel>
                        <Select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            label="Reason"
                        >
                            <MenuItem value="spam">Spam</MenuItem>
                            <MenuItem value="harassment">Harassment</MenuItem>
                            <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
                            <MenuItem value="hate_speech">Hate Speech</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional Details (Optional)"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleReportComment}
                        variant="contained"
                        color="error"
                        disabled={!reportReason}
                    >
                        Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommentSection;
