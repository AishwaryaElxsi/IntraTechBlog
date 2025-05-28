import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Routes, Route } from 'react-router-dom';

import AuthProvider from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/Login';
import Register from './pages/Register';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2A43BF'
    },
    secondary: {
      main: '#F5B544'
    },
    background: {
      default: '#F7FAFC'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif'
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
