// 🎯 Reusable Action Card Component
// Used for call-to-action cards with icons, titles, descriptions, and buttons

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
} from '@mui/material';

const ActionCard = ({
    title,
    description,
    icon,
    buttonText,
    onClick,
    buttonVariant = 'contained',
    buttonColor = 'primary',
    buttonStartIcon,
    color = 'primary',
    ...cardProps
}) => {
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
            {...cardProps}
        >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {icon && (
                    <Box sx={{ mb: 2 }}>
                        {React.cloneElement(icon, {
                            sx: { 
                                fontSize: 60,
                                // Preserve original icon color if it exists, otherwise use semantic default
                                color: icon.props.sx?.color || 'inherit',
                                ...icon.props.sx 
                            }
                        })}
                    </Box>
                )}
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {description}
                </Typography>
                {buttonText && onClick && (
                    <Button
                        variant={buttonVariant}
                        color={buttonColor}
                        size="large"
                        onClick={onClick}
                        startIcon={buttonStartIcon}
                    >
                        {buttonText}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default ActionCard;
