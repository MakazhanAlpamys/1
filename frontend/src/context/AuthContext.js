import React, { createContext, useState, useEffect, useCallback } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout user - определяем функцию до её использования
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove token from axios defaults
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user in state
    setUser(null);
  };

  // Get user profile from API
  const getUserProfile = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Сохраняем пользователя в localStorage для восстановления после перезапуска
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
      setLoading(false);
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token) {
          // Check if token is expired
          const decoded = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token is expired
            logout();
            setLoading(false);
            return;
          }
          
          // Set token on axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Если есть сохраненные данные пользователя, используем их
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
          } else {
            // Иначе запрашиваем с сервера
            getUserProfile(token);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [getUserProfile]);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      
      // Преобразуем имена полей для соответствия бэкенду
      const transformedData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      };
      
      const res = await axios.post(`${API_URL}/auth/register`, transformedData);
      
      const { token, user } = res.data;
      
      // Set token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token on axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { token, user } = res.data;
      
      // Set token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token on axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const res = await axios.put(`${API_URL}/users/profile`, profileData);
      
      // Update user in state and localStorage
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      await axios.put(`${API_URL}/users/password`, passwordData);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated,
        isAdmin,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 