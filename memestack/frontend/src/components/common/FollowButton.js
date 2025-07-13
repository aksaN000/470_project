// 👥 Follow Button Component
// Reusable button for following/unfollowing users

import React, { useState, useEffect } from 'react';
import {
    Button,
    IconButton,
    Chip,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    PersonAdd as FollowIcon,
    PersonRemove as UnfollowIcon,
    Check as FollowingIcon,
} from '@mui/icons-material';
import { followAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FollowButton = ({ 
    userId, 
    username, 
    variant = 'button', // 'button', 'icon', 'chip'
    size = 'medium',
    onFollowChange,
    showFollowingState = true 
}) => {
    const { user: currentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Don't show follow button for current user
    if (!currentUser || currentUser._id === userId) {
        return null;
    }

    // Check follow status on mount
    useEffect(() => {
        const checkFollowStatus = async () => {
            try {
                setCheckingStatus(true);
                const response = await followAPI.getFollowStatus(userId);
                setIsFollowing(response.data.isFollowing);
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setCheckingStatus(false);
            }
        };

        if (userId && currentUser) {
            checkFollowStatus();
        }
    }, [userId, currentUser]);

    const handleFollowToggle = async () => {
        try {
            setLoading(true);
            
            if (isFollowing) {
                await followAPI.unfollowUser(userId);
                setIsFollowing(false);
                if (onFollowChange) onFollowChange(false);
            } else {
                await followAPI.followUser(userId);
                setIsFollowing(true);
                if (onFollowChange) onFollowChange(true);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            // You could add a toast notification here
        } finally {
            setLoading(false);
        }
    };

    // Show loading spinner while checking status
    if (checkingStatus) {
        return (
            <CircularProgress size={variant === 'icon' ? 24 : 20} />
        );
    }

    // Render different variants
    switch (variant) {
        case 'icon':
            return (
                <Tooltip title={isFollowing ? `Unfollow ${username}` : `Follow ${username}`}>
                    <IconButton
                        onClick={handleFollowToggle}
                        disabled={loading}
                        size={size}
                        color={isFollowing ? 'primary' : 'default'}
                    >
                        {loading ? (
                            <CircularProgress size={20} />
                        ) : isFollowing ? (
                            showFollowingState ? <FollowingIcon /> : <UnfollowIcon />
                        ) : (
                            <FollowIcon />
                        )}
                    </IconButton>
                </Tooltip>
            );

        case 'chip':
            return (
                <Chip
                    label={isFollowing ? 'Following' : 'Follow'}
                    onClick={handleFollowToggle}
                    disabled={loading}
                    size={size}
                    color={isFollowing ? 'primary' : 'default'}
                    variant={isFollowing ? 'filled' : 'outlined'}
                    icon={loading ? (
                        <CircularProgress size={16} />
                    ) : isFollowing ? (
                        showFollowingState ? <FollowingIcon /> : <UnfollowIcon />
                    ) : (
                        <FollowIcon />
                    )}
                />
            );

        case 'button':
        default:
            return (
                <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    color={isFollowing ? 'primary' : 'primary'}
                    onClick={handleFollowToggle}
                    disabled={loading}
                    size={size}
                    startIcon={loading ? (
                        <CircularProgress size={16} />
                    ) : isFollowing ? (
                        showFollowingState ? <FollowingIcon /> : <UnfollowIcon />
                    ) : (
                        <FollowIcon />
                    )}
                >
                    {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
            );
    }
};

export default FollowButton;
