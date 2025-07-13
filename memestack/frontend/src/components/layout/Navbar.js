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
    Logout as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { user, isAuthenticated, logout } = useAuth();
    
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
    ];

    const privateNavItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Create', path: '/create', icon: <AddIcon /> },
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
            </List>
        </Drawer>
    );

    return (
        <>
            <AppBar 
                position="sticky" 
                elevation={1}
                sx={{ 
                    backgroundColor: 'primary.main',
                    backdropFilter: 'blur(10px)',
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
                            fontWeight: 700,
                            cursor: 'pointer',
                            mr: 4,
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
                                            alt={user?.username}
                                        >
                                            {user?.username?.charAt(0).toUpperCase()}
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
