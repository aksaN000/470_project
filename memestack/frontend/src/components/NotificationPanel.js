// 🔔 Notification Panel Component
// Displays real-time notifications for collaboration activities

import React from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    Avatar,
    ListItemIcon,
    ListItemText,
    Tooltip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
    Clear as ClearIcon,
    DoneAll as DoneAllIcon
} from '@mui/icons-material';

const NotificationPanel = ({ 
    notifications, 
    unreadCount, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onClear 
}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            new_version: '🆕',
            new_comment: '💬',
            user_joined: '👥',
            fork_created: '🍴',
            invitation_sent: '✉️'
        };
        return iconMap[type] || '📢';
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return timestamp.toLocaleDateString();
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton onClick={handleClick} color="inherit">
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 350,
                        maxHeight: 400,
                        mt: 1.5
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Notifications
                    </Typography>
                    {notifications.length > 0 && (
                        <Box display="flex" gap={1}>
                            <Tooltip title="Mark all as read">
                                <IconButton size="small" onClick={onMarkAllAsRead}>
                                    <DoneAllIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Clear all">
                                <IconButton size="small" onClick={onClear}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
                
                <Divider />

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => onMarkAsRead(notification.id)}
                            sx={{
                                opacity: notification.read ? 0.7 : 1,
                                bgcolor: notification.read ? 'transparent' : 'action.hover'
                            }}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                                    {getNotificationIcon(notification.type)}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle2">
                                            {notification.title}
                                        </Typography>
                                        {!notification.read && (
                                            <CircleIcon 
                                                color="primary" 
                                                sx={{ fontSize: 8 }} 
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" color="text.secondary">
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTime(notification.timestamp)}
                                        </Typography>
                                    </>
                                }
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationPanel;
