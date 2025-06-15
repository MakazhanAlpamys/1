import api from './api.service';

/**
 * Сервис для работы с контактными сообщениями
 */
const contactService = {
  /**
   * Отправка сообщения от пользователя
   * @param {Object} messageData - Данные сообщения
   * @returns {Promise} - Промис с результатом отправки
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/contact', messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение всех сообщений (для администратора)
   * @param {Object} filters - Параметры фильтрации
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество сообщений на странице
   * @returns {Promise} - Промис со списком сообщений
   */
  getAllMessages: async (filters = {}, page = 1, limit = 10) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/contact', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение одного сообщения по ID (для администратора)
   * @param {number} id - ID сообщения
   * @returns {Promise} - Промис с данными сообщения
   */
  getMessageById: async (id) => {
    try {
      const response = await api.get(`/contact/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Отметка сообщения как прочитанное (для администратора)
   * @param {number} id - ID сообщения
   * @returns {Promise} - Промис с результатом обновления
   */
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/contact/${id}/mark-read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ответ на сообщение (для администратора)
   * @param {number} id - ID сообщения
   * @param {string} replyText - Текст ответа
   * @returns {Promise} - Промис с результатом отправки ответа
   */
  replyToMessage: async (id, replyText) => {
    try {
      const response = await api.post(`/contact/${id}/reply`, { replyText });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление сообщения (для администратора)
   * @param {number} id - ID сообщения
   * @returns {Promise} - Промис с результатом удаления
   */
  deleteMessage: async (id) => {
    try {
      const response = await api.delete(`/contact/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default contactService; 