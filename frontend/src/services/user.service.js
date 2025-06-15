import api from './api.service';

/**
 * Сервис для работы с пользователями
 */
const userService = {
  /**
   * Получение профиля текущего пользователя
   * @returns {Promise} - Промис с данными профиля
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление профиля пользователя
   * @param {Object} userData - Новые данные пользователя
   * @returns {Promise} - Промис с результатом обновления
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Изменение пароля пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise} - Промис с результатом изменения пароля
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение избранных объектов недвижимости
   * @returns {Promise} - Промис со списком избранных объектов
   */
  getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Добавление объекта недвижимости в избранное
   * @param {number} propertyId - ID объекта недвижимости
   * @returns {Promise} - Промис с результатом добавления
   */
  addToFavorites: async (propertyId) => {
    try {
      const response = await api.post(`/users/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление объекта недвижимости из избранного
   * @param {number} propertyId - ID объекта недвижимости
   * @returns {Promise} - Промис с результатом удаления
   */
  removeFromFavorites: async (propertyId) => {
    try {
      const response = await api.delete(`/users/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService; 