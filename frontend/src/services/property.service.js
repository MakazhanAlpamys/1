import api from './api.service';

/**
 * Сервис для работы с объектами недвижимости
 */
const propertyService = {
  /**
   * Получение списка объектов недвижимости с фильтрацией
   * @param {Object} filters - Параметры фильтрации
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество объектов на странице
   * @returns {Promise} - Промис с результатами поиска
   */
  getProperties: async (filters = {}, page = 1, limit = 10) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/properties', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение одного объекта недвижимости по ID
   * @param {number} id - ID объекта недвижимости
   * @returns {Promise} - Промис с данными объекта недвижимости
   */
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание нового объекта недвижимости
   * @param {Object} propertyData - Данные объекта недвижимости
   * @param {Array} images - Массив файлов изображений
   * @returns {Promise} - Промис с результатом создания
   */
  createProperty: async (propertyData, images) => {
    try {
      const formData = new FormData();
      
      // Добавление данных объекта недвижимости
      Object.keys(propertyData).forEach(key => {
        formData.append(key, propertyData[key]);
      });
      
      // Добавление изображений
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление объекта недвижимости
   * @param {number} id - ID объекта недвижимости
   * @param {Object} propertyData - Новые данные объекта недвижимости
   * @returns {Promise} - Промис с результатом обновления
   */
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление объекта недвижимости
   * @param {number} id - ID объекта недвижимости
   * @returns {Promise} - Промис с результатом удаления
   */
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Добавление изображений к объекту недвижимости
   * @param {number} id - ID объекта недвижимости
   * @param {Array} images - Массив файлов изображений
   * @returns {Promise} - Промис с результатом добавления изображений
   */
  addPropertyImages: async (id, images) => {
    try {
      const formData = new FormData();
      
      // Добавление изображений
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post(`/properties/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление изображения объекта недвижимости
   * @param {number} propertyId - ID объекта недвижимости
   * @param {number} imageId - ID изображения
   * @returns {Promise} - Промис с результатом удаления изображения
   */
  deletePropertyImage: async (propertyId, imageId) => {
    try {
      const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение объектов недвижимости текущего пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество объектов на странице
   * @returns {Promise} - Промис с объектами недвижимости пользователя
   */
  getUserProperties: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/properties/user/my-properties', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default propertyService; 