// 🧭 Navigation Bar Component
// Top navigation with authentication and menu items

import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    PhotoLibrary as GalleryIcon,
    Add as AddIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    People as PeopleIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    EmojiEvents,
    Groups,
    Handshake,
    Brightness4,
    Brightness7
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { user, isAuthenticated, logout } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    
    // State for mobile menu and user menu
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Handle mobile menu toggle
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle user menu
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // Handle logout
    const handleLogout = async () => {
        handleCloseMenu();
        await logout();
        navigate('/');
    };

    // Navigation items
    const publicNavItems = [
        { label: 'Home', path: '/', icon: <HomeIcon /> },
        { label: 'Gallery', path: '/gallery', icon: <GalleryIcon /> },
        { label: 'Browse Users', path: '/browse-users', icon: <PeopleIcon /> },
        { label: 'Challenges', path: '/challenges', icon: <EmojiEvents /> },
        { label: 'Groups', path: '/groups', icon: <Groups /> },
        { label: 'Collaborations', path: '/collaborations', icon: <Handshake /> },
    ];

    const privateNavItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Feed', path: '/feed', icon: <GalleryIcon /> },
        { label: 'Create', path: '/create', icon: <AddIcon /> },
        { label: 'Templates', path: '/templates', icon: <DashboardIcon /> },
        { label: 'Batch Process', path: '/batch', icon: <DashboardIcon /> },
        { label: 'Folders', path: '/folders', icon: <DashboardIcon /> },
        { label: 'Analytics', path: '/analytics', icon: <DashboardIcon /> },
    ];

    // Admin-only nav items
    const adminNavItems = [
        { label: 'Moderation', path: '/moderation', icon: <DashboardIcon /> },
    ];

    const authNavItems = [
        { label: 'Login', path: '/login', icon: <LoginIcon /> },
        { label: 'Register', path: '/register', icon: <RegisterIcon /> },
    ];

    // Check if current path is active
    const isActive = (path) => location.pathname === path;

    // Desktop Navigation Items
    const renderDesktopNav = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {publicNavItems.map((item) => (
                <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                        fontWeight: isActive(item.path) ? 600 : 400,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    {item.label}
                </Button>
            ))}

            {isAuthenticated && privateNavItems.map((item) => (
                <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                        fontWeight: isActive(item.path) ? 600 : 400,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    {item.label}
                </Button>
            ))}

            {isAuthenticated && user?.role === 'admin' && adminNavItems.map((item) => (
                <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                        fontWeight: isActive(item.path) ? 600 : 400,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    {item.label}
                </Button>
            ))}
        </Box>
    );

    // Mobile Navigation Drawer
    const renderMobileNav = () => (
        <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
                keepMounted: true, // Better open performance on mobile
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: 280,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                    🎭 MemeStack
                </Typography>
            </Box>
            <Divider />

            <List>
                {publicNavItems.map((item) => (
                    <ListItem
                        button
                        key={item.path}
                        onClick={() => {
                            navigate(item.path);
                            handleDrawerToggle();
                        }}
                        selected={isActive(item.path)}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}

                {isAuthenticated && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        {privateNavItems.map((item) => (
                            <ListItem
                                button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    handleDrawerToggle();
                                }}
                                selected={isActive(item.path)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                        
                        {user?.role === 'admin' && adminNavItems.map((item) => (
                            <ListItem
                                button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    handleDrawerToggle();
                                }}
                                selected={isActive(item.path)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                    </>
                )}

                <Divider sx={{ my: 1 }} />

                {isAuthenticated ? (
                    <>
                        <ListItem
                            button
                            onClick={() => {
                                navigate('/profile');
                                handleDrawerToggle();
                            }}
                            selected={isActive('/profile')}
                        >
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary="Profile" />
                        </ListItem>
                        <ListItem
                            button
                            onClick={() => {
                                navigate('/settings');
                                handleDrawerToggle();
                            }}
                            selected={isActive('/settings')}
                        >
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                ) : (
                    authNavItems.map((item) => (
                        <ListItem
                            button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                handleDrawerToggle();
                            }}
                            selected={isActive(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))
                )}
                
                {/* Theme Toggle in Mobile Menu */}
                <Divider sx={{ my: 1 }} />
                <ListItem 
                    button 
                    onClick={toggleTheme}
                >
                    <ListItemIcon>
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </ListItemIcon>
                    <ListItemText primary={`${mode === 'light' ? 'Dark' : 'Light'} Mode`} />
                </ListItem>
            </List>
        </Drawer>
    );

    return (
        <>
            <AppBar 
                position="sticky" 
                elevation={0}
                sx={{ 
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
                        : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    boxShadow: mode === 'light' 
                        ? '0 8px 32px rgba(99, 102, 241, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.5)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: mode === 'light' 
                            ? 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
                            : 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'shimmer 3s ease-in-out infinite',
                        pointerEvents: 'none',
                    },
                    '@keyframes shimmer': {
                        '0%': { backgroundPosition: '200% 200%' },
                        '100%': { backgroundPosition: '-200% -200%' },
                    },
                }}
            >
                <Toolbar>
                    {/* Mobile menu button */}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Logo */}
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: isMobile ? 1 : 0,
                            fontWeight: 800,
                            cursor: 'pointer',
                            mr: 4,
                            color: 'white',
                            background: mode === 'light' 
                                ? 'linear-gradient(45deg, #ffffff 0%, #e2e8f0 50%, #ffffff 100%)'
                                : 'linear-gradient(45deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            position: 'relative',
                            // Fallback for browsers that don't support background-clip
                            '@supports not (-webkit-background-clip: text)': {
                                background: 'none',
                                WebkitTextFillColor: 'white',
                                color: 'white',
                            },
                            '&:hover': {
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s ease-in-out',
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
                            },
                        }}
                        onClick={() => navigate('/')}
                    >
                        🎭 MemeStack
                    </Typography>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box sx={{ flexGrow: 1 }}>
                            {renderDesktopNav()}
                        </Box>
                    )}

                    {/* Theme Toggle Button */}
                    <IconButton 
                        sx={{ 
                            mr: 1,
                            background: mode === 'light' 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            width: 44,
                            height: 44,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                background: mode === 'light' 
                                    ? 'rgba(255, 255, 255, 0.3)' 
                                    : 'rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-2px) rotate(180deg)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                            },
                            '& .MuiSvgIcon-root': {
                                transition: 'all 0.3s ease',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            },
                        }} 
                        onClick={toggleTheme} 
                        color="inherit"
                        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    {/* User Authentication Section */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isAuthenticated ? (
                                <>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        color="inherit"
                                    >
                                        <Avatar 
                                            sx={{ width: 32, height: 32 }}
                                            src={user?.profile?.avatar}
                                            alt={user?.profile?.displayName || user?.username}
                                        >
                                            {(user?.profile?.displayName || user?.username)?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleCloseMenu}
                                    >
                                        <MenuItem onClick={() => { navigate('/profile'); handleCloseMenu(); }}>
                                            <PersonIcon sx={{ mr: 2 }} />
                                            Profile
                                        </MenuItem>
                                        <MenuItem onClick={() => { navigate('/settings'); handleCloseMenu(); }}>
                                            <SettingsIcon sx={{ mr: 2 }} />
                                            Settings
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <LogoutIcon sx={{ mr: 2 }} />
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Button 
                                        color="inherit" 
                                        onClick={() => navigate('/login')}
                                        sx={{ fontWeight: 500 }}
                                    >
                                        Login
                                    </Button>
                                    <Button 
                                        variant="outlined"
                                        color="inherit"
                                        onClick={() => navigate('/register')}
                                        sx={{ 
                                            fontWeight: 500,
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                            },
                                        }}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Navigation Drawer */}
            {renderMobileNav()}
        </>
    );
};

export default Navbar;
