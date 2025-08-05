// 📊 Reusable Statistics Card Component
// Used across Dashboard, Analytics, and other pages for consistent stat display

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const StatCard = ({
    title,
    value,
    icon,
    color = 'primary',
    growth,
    subtitle,
    variant = 'default', // 'default', 'compact', 'detailed'
    onClick,
    ...cardProps
}) => {
    // Format numbers for display
    const formatNumber = (num) => {
        if (isNaN(num)) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Format percentage
    const formatPercentage = (num) => {
        if (isNaN(num)) return '0%';
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    // Render based on variant
    const renderContent = () => {
        switch (variant) {
            case 'compact':
                return (
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
                            {formatNumber(value)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </CardContent>
                );

            case 'detailed':
                return (
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {icon && (
                                <Box
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor: `${color}.light`,
                                        color: `${color}.contrastText`,
                                        mr: 2,
                                    }}
                                >
                                    {icon}
                                </Box>
                            )}
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                    {formatNumber(value)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {title}
                                </Typography>
                                {subtitle && (
                                    <Typography variant="caption" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        {growth !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {growth >= 0 ? (
                                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                                )}
                                <Typography
                                    variant="body2"
                                    color={growth >= 0 ? 'success.main' : 'error.main'}
                                >
                                    {formatPercentage(growth)} from last period
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                );

            default: // 'default'
                return (
                    <CardContent sx={{ textAlign: 'center' }}>
                        {icon && (
                            <Box sx={{ mb: 2 }}>
                                {React.cloneElement(icon, {
                                    sx: { fontSize: 40, color: `${color}.main`, ...icon.props.sx }
                                })}
                            </Box>
                        )}
                        <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
                            {formatNumber(value)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                {subtitle}
                            </Typography>
                        )}
                        {growth !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                {growth >= 0 ? (
                                    <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                                ) : (
                                    <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                                )}
                                <Typography
                                    variant="caption"
                                    color={growth >= 0 ? 'success.main' : 'error.main'}
                                >
                                    {formatPercentage(growth)}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                );
        }
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[4],
                } : {},
                transition: 'transform 0.2s, box-shadow 0.2s',
                ...cardProps.sx 
            }}
            onClick={onClick}
            {...cardProps}
        >
            {renderContent()}
        </Card>
    );
};

export default StatCard;
