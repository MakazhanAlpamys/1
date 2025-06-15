import api from './api.service';

/**
 * Сервис для работы с административными функциями
 */
const adminService = {
  /**
   * Получение списка пользователей
   * @param {Object} filters - Параметры фильтрации
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество пользователей на странице
   * @returns {Promise} - Промис со списком пользователей
   */
  getUsers: async (filters = {}, page = 1, limit = 10) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение одного пользователя по ID
   * @param {number} id - ID пользователя
   * @returns {Promise} - Промис с данными пользователя
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Блокировка/разблокировка пользователя
   * @param {number} id - ID пользователя
   * @param {boolean} isActive - Статус активности
   * @returns {Promise} - Промис с результатом обновления
   */
  toggleUserStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/admin/users/${id}/toggle-status`, { isActive });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Назначение/снятие роли администратора
   * @param {number} id - ID пользователя
   * @param {boolean} isAdmin - Статус администратора
   * @returns {Promise} - Промис с результатом обновления
   */
  toggleAdminRole: async (id, isAdmin) => {
    try {
      const response = await api.put(`/admin/users/${id}/toggle-admin`, { isAdmin });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление пользователя
   * @param {number} id - ID пользователя
   * @returns {Promise} - Промис с результатом удаления
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение статистики для панели администратора
   * @returns {Promise} - Промис с данными статистики
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение списка объектов недвижимости для администратора
   * @param {Object} filters - Параметры фильтрации
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество объектов на странице
   * @returns {Promise} - Промис со списком объектов недвижимости
   */
  getProperties: async (filters = {}, page = 1, limit = 10) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/admin/properties', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Изменение статуса объекта недвижимости
   * @param {number} id - ID объекта недвижимости
   * @param {string} status - Новый статус
   * @returns {Promise} - Промис с результатом обновления
   */
  updatePropertyStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/properties/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление объекта недвижимости администратором
   * @param {number} id - ID объекта недвижимости
   * @returns {Promise} - Промис с результатом удаления
   */
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/admin/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminService; 