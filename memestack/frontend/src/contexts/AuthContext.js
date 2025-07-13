// 🎯 Authentication Context
// Global state management for user authentication

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, getCurrentUser, isAuthenticated, clearAuthData } from '../services/api';

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext();

// ========================================
// ACTION TYPES
// ========================================

const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    LOGOUT: 'LOGOUT',
    LOAD_USER: 'LOAD_USER',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// ========================================
// REDUCER
// ========================================

const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOAD_USER:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: action.payload.isAuthenticated,
                isLoading: false,
            };

        case AUTH_ACTIONS.UPDATE_PROFILE:
            return {
                ...state,
                user: action.payload.user,
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// ========================================
// CONTEXT PROVIDER
// ========================================

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user on app start
    useEffect(() => {
        const loadUser = () => {
            const user = getCurrentUser();
            const token = localStorage.getItem('token');
            const authenticated = isAuthenticated();

            dispatch({
                type: AUTH_ACTIONS.LOAD_USER,
                payload: {
                    user,
                    token,
                    isAuthenticated: authenticated,
                },
            });
        };

        loadUser();
    }, []);

    // ========================================
    // AUTH ACTIONS
    // ========================================

    const login = useCallback(async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });

            const response = await authAPI.login(credentials);

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return { success: true, user: response.user };
        } catch (error) {
            const errorMessage = error.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const register = useCallback(async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.REGISTER_START });

            const response = await authAPI.register(userData);

            dispatch({
                type: AUTH_ACTIONS.REGISTER_SUCCESS,
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return { success: true, user: response.user };
        } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    }, []); // useCallback dependency array

    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await authAPI.updateProfile(profileData);
            
            dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE,
                payload: {
                    user: response.user,
                },
            });

            return { success: true, user: response.user };
        } catch (error) {
            const errorMessage = error.message || 'Profile update failed';
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value = {
        // State
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,

        // Actions
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ========================================
// CUSTOM HOOK
// ========================================

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

export default AuthContext;
