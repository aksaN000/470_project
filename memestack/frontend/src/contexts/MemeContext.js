// 🎭 Meme Context
// Global state management for memes

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { memeAPI } from '../services/api';

// ========================================
// CONTEXT CREATION
// ========================================

const MemeContext = createContext();

// ========================================
// ACTION TYPES
// ========================================

const MEME_ACTIONS = {
    FETCH_MEMES_START: 'FETCH_MEMES_START',
    FETCH_MEMES_SUCCESS: 'FETCH_MEMES_SUCCESS',
    FETCH_MEMES_FAILURE: 'FETCH_MEMES_FAILURE',
    
    FETCH_TRENDING_START: 'FETCH_TRENDING_START',
    FETCH_TRENDING_SUCCESS: 'FETCH_TRENDING_SUCCESS',
    FETCH_TRENDING_FAILURE: 'FETCH_TRENDING_FAILURE',
    
    CREATE_MEME_START: 'CREATE_MEME_START',
    CREATE_MEME_SUCCESS: 'CREATE_MEME_SUCCESS',
    CREATE_MEME_FAILURE: 'CREATE_MEME_FAILURE',
    
    UPDATE_MEME: 'UPDATE_MEME',
    DELETE_MEME: 'DELETE_MEME',
    TOGGLE_LIKE: 'TOGGLE_LIKE',
    
    SET_CURRENT_MEME: 'SET_CURRENT_MEME',
    SET_FILTERS: 'SET_FILTERS',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
    memes: [],
    trendingMemes: [],
    currentMeme: null,
    myMemes: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalMemes: 0,
        hasNext: false,
        hasPrev: false,
    },
    filters: {
        category: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        tags: [],
    },
    loading: {
        memes: false,
        trending: false,
        creating: false,
    },
    error: null,
};

// ========================================
// REDUCER
// ========================================

const memeReducer = (state, action) => {
    switch (action.type) {
        case MEME_ACTIONS.FETCH_MEMES_START:
            return {
                ...state,
                loading: { ...state.loading, memes: true },
                error: null,
            };

        case MEME_ACTIONS.FETCH_MEMES_SUCCESS:
            return {
                ...state,
                memes: action.payload.memes,
                pagination: action.payload.pagination,
                loading: { ...state.loading, memes: false },
                error: null,
            };

        case MEME_ACTIONS.FETCH_MEMES_FAILURE:
            return {
                ...state,
                loading: { ...state.loading, memes: false },
                error: action.payload,
            };

        case MEME_ACTIONS.FETCH_TRENDING_START:
            return {
                ...state,
                loading: { ...state.loading, trending: true },
                error: null,
            };

        case MEME_ACTIONS.FETCH_TRENDING_SUCCESS:
            return {
                ...state,
                trendingMemes: action.payload.memes,
                loading: { ...state.loading, trending: false },
                error: null,
            };

        case MEME_ACTIONS.FETCH_TRENDING_FAILURE:
            return {
                ...state,
                loading: { ...state.loading, trending: false },
                error: action.payload,
            };

        case MEME_ACTIONS.CREATE_MEME_START:
            return {
                ...state,
                loading: { ...state.loading, creating: true },
                error: null,
            };

        case MEME_ACTIONS.CREATE_MEME_SUCCESS:
            return {
                ...state,
                memes: [action.payload.meme, ...state.memes],
                myMemes: [action.payload.meme, ...state.myMemes],
                loading: { ...state.loading, creating: false },
                error: null,
            };

        case MEME_ACTIONS.CREATE_MEME_FAILURE:
            return {
                ...state,
                loading: { ...state.loading, creating: false },
                error: action.payload,
            };

        case MEME_ACTIONS.UPDATE_MEME:
            return {
                ...state,
                memes: state.memes.map(meme => 
                    meme.id === action.payload.id ? action.payload.meme : meme
                ),
                myMemes: state.myMemes.map(meme => 
                    meme.id === action.payload.id ? action.payload.meme : meme
                ),
                currentMeme: state.currentMeme?.id === action.payload.id ? 
                    action.payload.meme : state.currentMeme,
            };

        case MEME_ACTIONS.DELETE_MEME:
            return {
                ...state,
                memes: state.memes.filter(meme => meme.id !== action.payload.id),
                myMemes: state.myMemes.filter(meme => meme.id !== action.payload.id),
                currentMeme: state.currentMeme?.id === action.payload.id ? 
                    null : state.currentMeme,
            };

        case MEME_ACTIONS.TOGGLE_LIKE:
            const updateLikes = (meme) => {
                if (meme.id === action.payload.id) {
                    return {
                        ...meme,
                        stats: {
                            ...meme.stats,
                            likesCount: action.payload.likesCount,
                        },
                        isLiked: action.payload.isLiked,
                    };
                }
                return meme;
            };

            return {
                ...state,
                memes: state.memes.map(updateLikes),
                trendingMemes: state.trendingMemes.map(updateLikes),
                myMemes: state.myMemes.map(updateLikes),
                currentMeme: state.currentMeme?.id === action.payload.id ? 
                    updateLikes(state.currentMeme) : state.currentMeme,
            };

        case MEME_ACTIONS.SET_CURRENT_MEME:
            return {
                ...state,
                currentMeme: action.payload.meme,
            };

        case MEME_ACTIONS.SET_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.payload.filters },
            };

        case MEME_ACTIONS.CLEAR_ERROR:
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

export const MemeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(memeReducer, initialState);

    // ========================================
    // MEME ACTIONS
    // ========================================

    const fetchMemes = useCallback(async (params = {}) => {
        try {
            dispatch({ type: MEME_ACTIONS.FETCH_MEMES_START });

            const response = await memeAPI.getAllMemes(params);

            dispatch({
                type: MEME_ACTIONS.FETCH_MEMES_SUCCESS,
                payload: {
                    memes: response.data.memes,
                    pagination: response.data.pagination,
                },
            });

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch memes';
            dispatch({
                type: MEME_ACTIONS.FETCH_MEMES_FAILURE,
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const fetchTrendingMemes = useCallback(async (limit = 10) => {
        try {
            dispatch({ type: MEME_ACTIONS.FETCH_TRENDING_START });

            const response = await memeAPI.getTrendingMemes(limit);

            dispatch({
                type: MEME_ACTIONS.FETCH_TRENDING_SUCCESS,
                payload: {
                    memes: response.data.memes,
                },
            });

            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch trending memes';
            dispatch({
                type: MEME_ACTIONS.FETCH_TRENDING_FAILURE,
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const createMeme = useCallback(async (memeData) => {
        try {
            dispatch({ type: MEME_ACTIONS.CREATE_MEME_START });

            const response = await memeAPI.createMeme(memeData);

            dispatch({
                type: MEME_ACTIONS.CREATE_MEME_SUCCESS,
                payload: {
                    meme: response.data.meme,
                },
            });

            return { success: true, meme: response.data.meme };
        } catch (error) {
            const errorMessage = error.message || 'Failed to create meme';
            dispatch({
                type: MEME_ACTIONS.CREATE_MEME_FAILURE,
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    }, []); // useCallback dependency array

    const updateMeme = useCallback(async (id, memeData) => {
        try {
            const response = await memeAPI.updateMeme(id, memeData);

            dispatch({
                type: MEME_ACTIONS.UPDATE_MEME,
                payload: {
                    id,
                    meme: response.data.meme,
                },
            });

            return { success: true, meme: response.data.meme };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to update meme' };
        }
    }, []); // useCallback dependency array

    const deleteMeme = useCallback(async (id) => {
        try {
            await memeAPI.deleteMeme(id);

            dispatch({
                type: MEME_ACTIONS.DELETE_MEME,
                payload: { id },
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete meme' };
        }
    }, []); // useCallback dependency array

    const toggleLike = useCallback(async (id) => {
        try {
            const response = await memeAPI.toggleLike(id);

            dispatch({
                type: MEME_ACTIONS.TOGGLE_LIKE,
                payload: {
                    id,
                    isLiked: response.data.isLiked,
                    likesCount: response.data.likesCount,
                },
            });

            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to toggle like' };
        }
    }, []); // useCallback dependency array

    const setCurrentMeme = useCallback((meme) => {
        dispatch({
            type: MEME_ACTIONS.SET_CURRENT_MEME,
            payload: { meme },
        });
    }, []);

    const setFilters = useCallback((filters) => {
        dispatch({
            type: MEME_ACTIONS.SET_FILTERS,
            payload: { filters },
        });
    }, []); // useCallback dependency array

    const clearError = useCallback(() => {
        dispatch({ type: MEME_ACTIONS.CLEAR_ERROR });
    }, []);

    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value = {
        // State
        memes: state.memes,
        trendingMemes: state.trendingMemes,
        currentMeme: state.currentMeme,
        myMemes: state.myMemes,
        pagination: state.pagination,
        filters: state.filters,
        loading: state.loading,
        error: state.error,

        // Actions
        fetchMemes,
        fetchTrendingMemes,
        createMeme,
        updateMeme,
        deleteMeme,
        toggleLike,
        setCurrentMeme,
        setFilters,
        clearError,
    };

    return (
        <MemeContext.Provider value={value}>
            {children}
        </MemeContext.Provider>
    );
};

// ========================================
// CUSTOM HOOK
// ========================================

export const useMemes = () => {
    const context = useContext(MemeContext);
    
    if (!context) {
        throw new Error('useMemes must be used within a MemeProvider');
    }
    
    return context;
};

export default MemeContext;
