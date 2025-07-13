// 🔒 Protected Route Component
// Wraps components that require authentication

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // Render the protected component
    return children;
};

export default ProtectedRoute;
