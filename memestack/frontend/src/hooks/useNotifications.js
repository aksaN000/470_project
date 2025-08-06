// 🔔 Notification Hook
// Real-time notifications for collaboration activities

import { useState, useEffect, useCallback } from 'react';

const useNotifications = (collaborationId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Simulate real-time notifications (in a real app, this would use WebSocket)
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            read: false,
            ...notification
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification(`MemeStack: ${notification.title}`, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: `collab-${collaborationId}`
            });
        }
    }, [collaborationId]);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Simulate collaboration activity notifications
    useEffect(() => {
        if (!collaborationId) return;

        const interval = setInterval(() => {
            // Simulate random collaboration activities
            const activities = [
                {
                    type: 'new_version',
                    title: 'New Version Created',
                    message: 'A collaborator added a new version to the project',
                    icon: '🆕'
                },
                {
                    type: 'new_comment',
                    title: 'New Comment',
                    message: 'Someone commented on the collaboration',
                    icon: '💬'
                },
                {
                    type: 'user_joined',
                    title: 'New Collaborator',
                    message: 'A new user joined the collaboration',
                    icon: '👥'
                }
            ];

            // 5% chance every 30 seconds to show a notification
            if (Math.random() < 0.05) {
                const activity = activities[Math.floor(Math.random() * activities.length)];
                addNotification(activity);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [collaborationId, addNotification]);

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
    };
};

export default useNotifications;
