// 🎨 Theme Context Provider
// Manages dark/light theme switching with user preferences

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [mode, setMode] = useState('light');

    // Initialize theme from user preferences or localStorage
    useEffect(() => {
        if (user?.preferences?.theme) {
            setMode(user.preferences.theme);
        } else {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                setMode(savedTheme);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setMode(prefersDark ? 'dark' : 'light');
            }
        }
    }, [user]);

    // Save theme to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('theme', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newMode) => {
        setMode(newMode);
    };

    // Create Material-UI theme
    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#6366f1' : '#8b5cf6',
                light: mode === 'light' ? '#818cf8' : '#a78bfa',
                dark: mode === 'light' ? '#4f46e5' : '#7c3aed',
                contrastText: '#ffffff',
            },
            secondary: {
                main: mode === 'light' ? '#ec4899' : '#f472b6',
                light: mode === 'light' ? '#f472b6' : '#f9a8d4',
                dark: mode === 'light' ? '#db2777' : '#ec4899',
                contrastText: '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0f172a',
                paper: mode === 'light' ? '#ffffff' : '#1e293b',
            },
            text: {
                primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
                secondary: mode === 'light' ? '#64748b' : '#94a3b8',
            },
            divider: mode === 'light' ? '#e2e8f0' : '#334155',
            action: {
                hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
                disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
            },
            h2: {
                fontSize: '2rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
            },
            h3: {
                fontSize: '1.5rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
            },
            h4: {
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
            },
            h5: {
                fontSize: '1.125rem',
                fontWeight: 600,
            },
            h6: {
                fontSize: '1rem',
                fontWeight: 600,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.6,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.5,
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarWidth: 'thin',
                        scrollbarColor: mode === 'light' ? '#cbd5e1 #f1f5f9' : '#475569 #1e293b',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: mode === 'light' ? '#f1f5f9' : '#1e293b',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: mode === 'light' ? '#cbd5e1' : '#475569',
                            borderRadius: '4px',
                            '&:hover': {
                                background: mode === 'light' ? '#94a3b8' : '#64748b',
                            },
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '8px 20px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: mode === 'light' 
                                ? '0 4px 8px rgba(0, 0, 0, 0.12)' 
                                : '0 4px 8px rgba(0, 0, 0, 0.3)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: mode === 'light' 
                            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                            : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
                        border: mode === 'dark' ? '1px solid #334155' : 'none',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: mode === 'dark' ? '1px solid #334155' : 'none',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#6366f1' : '#1e293b',
                        boxShadow: mode === 'light' 
                            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                            : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
                        borderBottom: mode === 'dark' ? '1px solid #334155' : 'none',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                        borderRight: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                        border: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                        boxShadow: mode === 'light' 
                            ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                            : '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: mode === 'light' ? '#d1d5db' : '#4b5563',
                            },
                            '&:hover fieldset': {
                                borderColor: mode === 'light' ? '#9ca3af' : '#6b7280',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: mode === 'light' ? '#6366f1' : '#8b5cf6',
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#f1f5f9' : '#334155',
                        color: mode === 'light' ? '#475569' : '#e2e8f0',
                        '&.MuiChip-colorPrimary': {
                            backgroundColor: mode === 'light' ? '#ddd6fe' : '#4c1d95',
                            color: mode === 'light' ? '#5b21b6' : '#c4b5fd',
                        },
                        '&.MuiChip-colorSecondary': {
                            backgroundColor: mode === 'light' ? '#fce7f3' : '#831843',
                            color: mode === 'light' ? '#be185d' : '#f9a8d4',
                        },
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: mode === 'light' 
                                ? 'rgba(0, 0, 0, 0.04)' 
                                : 'rgba(255, 255, 255, 0.08)',
                        },
                    },
                },
            },
        },
    });

    const value = {
        mode,
        theme,
        toggleTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
