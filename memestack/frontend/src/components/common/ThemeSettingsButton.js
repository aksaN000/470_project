// 🎨 Theme Settings Button
// Quick access button for color scheme selector

import React, { useState } from 'react';
import {
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Switch,
    FormControlLabel,
    Box,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Palette as PaletteIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    AutoMode as AutoModeIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';
import ColorSchemeSelector from './ColorSchemeSelector';

const ThemeSettingsButton = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [colorSchemeOpen, setColorSchemeOpen] = useState(false);
    const { mode, toggleTheme, colorScheme, colorSchemes, currentScheme } = useThemeMode();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleColorSchemeOpen = () => {
        setColorSchemeOpen(true);
        handleClose();
    };

    const currentSchemeName = colorSchemes[colorScheme]?.name || 'Default';

    return (
        <>
            <Tooltip title="Theme Settings">
                <IconButton
                    onClick={handleClick}
                    sx={(theme) => ({
                        color: theme.palette.mode === 'light' ? '#374151' : '#fafafa',
                        background: theme.palette.mode === 'light' ? '#f3f4f6' : '#222',
                        border: `1px solid ${theme.palette.mode === 'light' ? '#d1d5db' : '#444'}`,
                        boxShadow: 'none',
                        '&:hover': {
                            background: theme.palette.mode === 'light' ? '#e5e7eb' : '#333',
                            transform: 'rotate(90deg)',
                            transition: 'transform 0.3s ease',
                        }
                    })}
                >
                    <SettingsIcon sx={(theme) => ({ color: theme.palette.mode === 'light' ? '#374151' : '#fafafa' })} />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        backdropFilter: 'blur(20px)',
                        background: (theme) => theme.palette.mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,30,0.95)',
                        border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#e5e7eb' : '#444'}`,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, pb: 1 }}>
                    <Typography variant="subtitle2" color="text.primary">
                        Theme Settings
                    </Typography>
                </Box>

                <Divider sx={{ mx: 1 }} />

                <MenuItem onClick={handleColorSchemeOpen}>
                    <ListItemIcon>
                        <PaletteIcon fontSize="small" sx={{ color: '#ec4899' }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={<span style={{ color: '#374151' }}>Color Scheme</span>}
                        secondary={currentSchemeName}
                    />
                </MenuItem>

                <Divider sx={{ mx: 1 }} />

                <Box sx={{ p: 2, pt: 1 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mode === 'dark'}
                                onChange={toggleTheme}
                                size="small"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {mode === 'dark' ? (
                                    <DarkModeIcon fontSize="small" sx={{ color: currentScheme?.primary || 'primary.main' }} />
                                ) : (
                                    <LightModeIcon fontSize="small" sx={{ color: currentScheme?.primary || 'primary.main' }} />
                                )}
                                <Typography variant="body2" sx={{ color: theme => theme.palette.mode === 'light' ? '#374151' : '#fafafa' }}>
                                    {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </Typography>
                            </Box>
                        }
                        sx={{ m: 0 }}
                    />
                </Box>
            </Menu>

            <ColorSchemeSelector
                open={colorSchemeOpen}
                onClose={() => setColorSchemeOpen(false)}
            />
        </>
    );
};

export default ThemeSettingsButton;
