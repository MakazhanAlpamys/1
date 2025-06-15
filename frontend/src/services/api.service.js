import axios from 'axios';
import authService from './auth.service';

// Определение базового URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание экземпляра axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавление перехватчика запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавление перехватчика ответов для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если сервер вернул ошибку 401 (неавторизован), выход из системы
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 