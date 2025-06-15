import axios from 'axios';
import jwt_decode from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

/**
 * Сервис для работы с аутентификацией
 */
const authService = {
  /**
   * Вход в систему
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise} - Промис с данными пользователя
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Регистрация нового пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise} - Промис с результатом регистрации
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Выход из системы
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Получение токена из локального хранилища
   * @returns {string|null} - Токен или null, если токен не найден
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Получение данных пользователя из локального хранилища
   * @returns {Object|null} - Данные пользователя или null, если пользователь не авторизован
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Проверка, авторизован ли пользователь
   * @returns {boolean} - true, если пользователь авторизован, иначе false
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Проверка срока действия токена
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  /**
   * Проверка, является ли пользователь администратором
   * @returns {boolean} - true, если пользователь администратор, иначе false
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * Обновление данных пользователя в локальном хранилище
   * @param {Object} userData - Новые данные пользователя
   */
  updateUserData: (userData) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  }
};

export default authService; 