import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthStatus = () => {
    const { user, isAuthenticated, token } = useAuth();
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    return (
        <div style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            background: '#f0f0f0', 
            padding: '10px', 
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            <h4>🔐 Auth Status</h4>
            <div><strong>Context Auth:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Context User:</strong> {user?.username || 'None'}</div>
            <div><strong>Context Token:</strong> {token ? '✅ Present' : '❌ Missing'}</div>
            <div><strong>localStorage Token:</strong> {storedToken ? '✅ Present' : '❌ Missing'}</div>
            <div><strong>localStorage User:</strong> {storedUser ? '✅ Present' : '❌ Missing'}</div>
            {storedToken && (
                <div><strong>Token Preview:</strong> {storedToken.substring(0, 20)}...</div>
            )}
        </div>
    );
};

export default AuthStatus;
