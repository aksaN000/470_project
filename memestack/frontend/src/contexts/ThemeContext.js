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

// Color scheme definitions
const colorSchemes = {
    default: {
        name: 'Default Blue',
        light: {
            primary: '#6366f1',
            secondary: '#ec4899',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            surface: 'rgba(255, 255, 255, 0.15)',
        },
        dark: {
            primary: '#8b5cf6',
            secondary: '#f472b6',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            surface: 'rgba(255, 255, 255, 0.05)',
        }
    },
    ocean: {
        name: 'Ocean Breeze',
        light: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            surface: 'rgba(255, 255, 255, 0.15)',
        },
        dark: {
            primary: '#38bdf8',
            secondary: '#22d3ee',
            background: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
            surface: 'rgba(255, 255, 255, 0.05)',
        }
    },
    sunset: {
        name: 'Sunset Vibes',
        light: {
            primary: '#f97316',
            secondary: '#ef4444',
            background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
            surface: 'rgba(255, 255, 255, 0.25)',
        },
        dark: {
            primary: '#fb923c',
            secondary: '#f87171',
            background: 'linear-gradient(135deg, #9a3412 0%, #991b1b 100%)',
            surface: 'rgba(255, 255, 255, 0.08)',
        }
    },
    forest: {
        name: 'Forest Green',
        light: {
            primary: '#059669',
            secondary: '#10b981',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            surface: 'rgba(255, 255, 255, 0.25)',
        },
        dark: {
            primary: '#34d399',
            secondary: '#6ee7b7',
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            surface: 'rgba(255, 255, 255, 0.08)',
        }
    },
    purple: {
        name: 'Purple Dream',
        light: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            surface: 'rgba(255, 255, 255, 0.25)',
        },
        dark: {
            primary: '#a78bfa',
            secondary: '#c084fc',
            background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
            surface: 'rgba(255, 255, 255, 0.08)',
        }
    }
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [mode, setMode] = useState('light');
    const [colorScheme, setColorScheme] = useState('default');

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

        // Load saved color scheme
        const savedColorScheme = localStorage.getItem('colorScheme');
        if (savedColorScheme && colorSchemes[savedColorScheme]) {
            setColorScheme(savedColorScheme);
        }
    }, [user]);

    // Save theme to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('theme', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('colorScheme', colorScheme);
    }, [colorScheme]);

    const toggleTheme = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newMode) => {
        setMode(newMode);
    };

    const setThemeColorScheme = (scheme) => {
        if (colorSchemes[scheme]) {
            setColorScheme(scheme);
        }
    };

    // Get current color scheme colors
    const currentScheme = colorSchemes[colorScheme][mode];

    // Helper function to lighten/darken colors
    const adjustColor = (color, amount) => {
        const clamp = (val) => Math.min(Math.max(val, 0), 255);
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = clamp(r + amount);
        const newG = clamp(g + amount);
        const newB = clamp(b + amount);
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    // Create Material-UI theme
    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: currentScheme.primary,
                light: adjustColor(currentScheme.primary, mode === 'light' ? 40 : 60),
                dark: adjustColor(currentScheme.primary, mode === 'light' ? -40 : -60),
                contrastText: '#ffffff',
            },
            secondary: {
                main: currentScheme.secondary,
                light: adjustColor(currentScheme.secondary, mode === 'light' ? 40 : 60),
                dark: adjustColor(currentScheme.secondary, mode === 'light' ? -40 : -60),
                contrastText: '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0f172a',
                paper: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
            },
            text: {
                primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
                secondary: mode === 'light' ? '#64748b' : '#94a3b8',
            },
            divider: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            action: {
                hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
                disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            },
            // Custom properties for glassmorphism
            glass: {
                background: currentScheme.surface,
                border: mode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
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
                    contained: {
                        background: `linear-gradient(135deg, ${currentScheme.primary} 0%, ${currentScheme.secondary} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${adjustColor(currentScheme.primary, -20)} 0%, ${adjustColor(currentScheme.secondary, -20)} 100%)`,
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
                        backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: mode === 'light' 
                            ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                            : '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        background: `linear-gradient(135deg, ${currentScheme.primary} 0%, ${currentScheme.secondary} 50%, ${adjustColor(currentScheme.primary, 30)} 100%)`,
                        boxShadow: mode === 'light' 
                            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                            : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
                        borderBottom: mode === 'dark' ? `1px solid ${currentScheme.primary}50` : 'none',
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
                                borderColor: currentScheme.primary,
                            },
                        },
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(30, 41, 59, 0.98)',
                        backdropFilter: 'blur(16px)',
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: mode === 'light' 
                            ? '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                            : '0 25px 50px -12px rgb(0 0 0 / 0.6)',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    colorPrimary: {
                        backgroundColor: currentScheme.primary,
                        color: '#ffffff',
                    },
                    colorSecondary: {
                        backgroundColor: currentScheme.secondary,
                        color: '#ffffff',
                    },
                },
            },
            MuiFab: {
                styleOverrides: {
                    primary: {
                        background: `linear-gradient(135deg, ${currentScheme.primary} 0%, ${currentScheme.secondary} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${adjustColor(currentScheme.primary, -20)} 0%, ${adjustColor(currentScheme.secondary, -20)} 100%)`,
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
        colorScheme,
        colorSchemes,
        currentScheme,
        currentThemeColors: currentScheme, // For backward compatibility
        toggleTheme,
        setTheme,
        setThemeColorScheme,
    };

    // Debug log to check the value
    console.log('ThemeContext value:', { currentScheme, currentThemeColors: currentScheme });

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
