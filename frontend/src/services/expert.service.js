import api from './api.service';

/**
 * Сервис для работы с экспертными функциями
 */
const expertService = {
  /**
   * Получение списка районов
   * @returns {Promise} - Промис со списком районов
   */
  getDistricts: async () => {
    try {
      const response = await api.get('/expert/districts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Расчет примерной стоимости недвижимости
   * @param {Object} propertyData - Данные для расчета
   * @returns {Promise} - Промис с результатом расчета
   */
  calculatePrice: async (propertyData) => {
    try {
      const response = await api.post('/expert/calculate', propertyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Запрос к AI-ассистенту
   * @param {string} query - Вопрос для AI
   * @param {Array} history - История предыдущих сообщений
   * @returns {Promise} - Промис с ответом AI
   */
  askAI: async (query, history = []) => {
    try {
      const response = await api.post('/expert/ai', { query, history });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default expertService; 