import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AddPropertyPage from './pages/AddPropertyPage';
import ExpertPage from './pages/ExpertPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import MyPropertiesPage from './pages/MyPropertiesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Основные страницы */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="properties/:id" element={<PropertyDetailPage />} />
              <Route path="expert" element={<ExpertPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              {/* Защищенные маршруты (только для авторизованных) */}
              <Route 
                path="properties/add" 
                element={
                  <ProtectedRoute>
                    <AddPropertyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="properties/:id/edit" 
                element={
                  <ProtectedRoute>
                    <AddPropertyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="my-properties" 
                element={
                  <ProtectedRoute>
                    <MyPropertiesPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Админ-панель */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="properties" element={<AdminPropertiesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>
            
            {/* Страница 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
