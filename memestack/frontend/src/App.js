// 🚀 MemeStack Frontend - Main App Component
// This is the root component that sets up routing and global providers

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { MemeProvider } from './contexts/MemeContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MemeGallery from './pages/MemeGallery';
import MemeDetail from './pages/MemeDetail';
import CreateMeme from './pages/CreateMeme';
import Profile from './pages/Profile';
import FollowingFeed from './pages/FollowingFeed';
import BrowseUsers from './pages/BrowseUsers';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ModerationDashboard from './pages/ModerationDashboard';
import FolderManager from './pages/FolderManager';
import TemplateManager from './pages/TemplateManager';
import BatchProcessor from './pages/BatchProcessor';
import Challenges from './pages/Challenges';
import Groups from './pages/Groups';
import Collaborations from './pages/Collaborations';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

// ========================================
// THEME CONFIGURATION
// ========================================

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

// ========================================
// MAIN APP COMPONENT
// ========================================

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MemeProvider>
          <Router>
            <Box 
              sx={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.default',
              }}
            >
              {/* Navigation Bar */}
              <Navbar />

              {/* Main Content Area */}
              <Box 
                component="main" 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/gallery" element={<MemeGallery />} />
                  <Route path="/meme/:id" element={<MemeDetail />} />
                  <Route path="/browse-users" element={<BrowseUsers />} />

                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/create" 
                    element={
                      <ProtectedRoute>
                        <CreateMeme />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/feed" 
                    element={
                      <ProtectedRoute>
                        <FollowingFeed />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute>
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/moderation" 
                    element={
                      <ProtectedRoute>
                        <ModerationDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/folders" 
                    element={
                      <ProtectedRoute>
                        <FolderManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/templates" 
                    element={
                      <ProtectedRoute>
                        <TemplateManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/batch" 
                    element={
                      <ProtectedRoute>
                        <BatchProcessor />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Collaboration Feature Routes */}
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/collaborations" element={<Collaborations />} />

                  {/* Redirect /memes to /gallery for consistency */}
                  <Route path="/memes" element={<Navigate to="/gallery" replace />} />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>

              {/* Footer */}
              <Footer />
            </Box>
          </Router>
        </MemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
