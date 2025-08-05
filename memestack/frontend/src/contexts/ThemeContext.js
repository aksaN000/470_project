// 🎨 Theme Context Provider
// Global theme management for the application

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
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

    // Create Material-UI theme
    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#1976d2' : '#90caf9',
                light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
                dark: mode === 'light' ? '#1565c0' : '#42a5f5',
                contrastText: '#fff',
            },
            secondary: {
                main: mode === 'light' ? '#dc004e' : '#f48fb1',
                light: mode === 'light' ? '#ff5983' : '#fce4ec',
                dark: mode === 'light' ? '#9a0036' : '#f48fb1',
                contrastText: '#fff',
            },
            background: {
                default: mode === 'light' ? '#fafafa' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
            text: {
                primary: mode === 'light' ? '#212121' : '#ffffff',
                secondary: mode === 'light' ? '#757575' : '#b0b0b0',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 600,
            },
            h4: {
                fontSize: '1.75rem',
                fontWeight: 600,
            },
            h6: {
                fontSize: '1.25rem',
                fontWeight: 500,
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 500,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: mode === 'light' 
                            ? '0 2px 8px rgba(0,0,0,0.1)' 
                            : '0 2px 8px rgba(0,0,0,0.3)',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#1976d2' : '#1e1e1e',
                    },
                },
            },
        },
    });

    const contextValue = {
        mode,
        setMode,
        toggleTheme,
        theme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
