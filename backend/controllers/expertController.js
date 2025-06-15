const { pool } = require('../database');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Контекст для недвижимости в Астане
const DISTRICTS_INFO = {
  'Есиль': 'Современный, престижный район с новыми высотками и правительственными зданиями',
  'Алматы': 'Старый, исторический центр города с развитой инфраструктурой',
  'Сарыарка': 'Большой спальный район с разнообразной недвижимостью',
  'Байконур': 'Промышленный район с доступным жильем',
  'Нура-Есиль': 'Быстрорастущий новый район с современными ЖК'
};

// Получение списка районов для фильтрации
exports.getDistricts = async (req, res) => {
  try {
    // Получаем уникальные районы из существующих объявлений
    const query = `
      SELECT DISTINCT district FROM properties
      ORDER BY district
    `;
    
    const result = await pool.query(query);
    
    // Если список пуст, возвращаем стандартные районы Астаны
    if (result.rows.length === 0) {
      const defaultDistricts = ['Есиль', 'Алматы', 'Сарыарка', 'Байконур', 'Нура-Есиль'];
      return res.status(200).json({ districts: defaultDistricts });
    }

    // Иначе возвращаем реальные районы из базы данных
    const districts = result.rows.map(row => row.district);
    return res.status(200).json({ districts });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Ошибка при получении списка районов' 
    });
  }
};

// Рассчет примерной стоимости недвижимости
exports.calculatePrice = async (req, res) => {
  try {
    const { 
      propertyType, 
      district, 
      area, 
      rooms, 
      yearBuilt, 
      condition 
    } = req.body;

    // Проверка обязательных полей
    if (!propertyType || !district || !area) {
      return res.status(400).json({ 
        success: false,
        message: 'Не указаны обязательные параметры' 
      });
    }

    // Для земельных участков используем специальную логику расчета
    if (propertyType === 'land') {
      // Базовые цены за сотку земли в разных районах (в тенге)
      const landBasePrices = {
        'Есиль': 3500000,
        'Алматы': 2800000,
        'Сарыарка': 2200000,
        'Байконур': 2000000,
        'Нура-Есиль': 3000000
      };
      
      // Базовая цена за сотку земли в выбранном районе
      const basePrice = landBasePrices[district] || 2500000;
      
      // Расчет цены с учетом площади (чем больше участок, тем ниже цена за сотку)
      let priceMultiplier = 1.0;
      
      const areaNum = Number(area);
      if (areaNum > 50) priceMultiplier = 0.85;
      else if (areaNum > 20) priceMultiplier = 0.9;
      else if (areaNum > 10) priceMultiplier = 0.95;
      else if (areaNum < 5) priceMultiplier = 1.1;
      
      // Расчет итоговой цены (площадь в сотках)
      const sotkiArea = areaNum / 100;
      const calculatedPrice = Math.round(basePrice * sotkiArea * priceMultiplier);
      
      // Добавляем случайность для реалистичности
      const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
      const finalPrice = Math.round(calculatedPrice * randomFactor / 1000) * 1000;
      
      // Формируем ответ
      const priceResult = {
        success: true,
        price: finalPrice,
        pricePerSqMeter: Math.round(finalPrice / areaNum),
        range: {
          min: Math.round(finalPrice * 0.9),
          max: Math.round(finalPrice * 1.1)
        }
      };
      
      return res.status(200).json(priceResult);
    }

    // Для остальных типов недвижимости используем стандартную логику
    // Находим среднюю цену за м² для похожих объявлений в базе
    let query = `
      SELECT price, area 
      FROM properties 
      WHERE property_type = $1 
      AND district = $2 
      AND area BETWEEN $3 AND $4
    `;
    
    const params = [
      propertyType,
      district,
      Number(area) * 0.8,
      Number(area) * 1.2
    ];
    
    if (rooms && rooms !== 'all') {
      query += ` AND rooms = $5`;
      params.push(rooms);
    }
    
    const result = await pool.query(query, params);
    const similarProperties = result.rows;

    let calculatedPrice = 0;
    
    if (similarProperties.length > 0) {
      // Рассчитываем среднюю цену за м² для найденных объявлений
      const totalPricePerSq = similarProperties.reduce((acc, property) => {
        return acc + (parseFloat(property.price) / parseFloat(property.area));
      }, 0);
      
      const avgPricePerSq = totalPricePerSq / similarProperties.length;
      
      // Корректируем цену в зависимости от состояния и года постройки
      let priceMultiplier = 1.0;
      
      if (condition === 'excellent') {
        priceMultiplier *= 1.15;
      } else if (condition === 'needs_repair') {
        priceMultiplier *= 0.8;
      } else if (condition === 'construction') {
        priceMultiplier *= 0.7;
      }
      
      // Корректировка по году постройки
      if (yearBuilt) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - Number(yearBuilt);
        
        if (age < 2) priceMultiplier *= 1.1;
        else if (age < 5) priceMultiplier *= 1.05;
        else if (age < 10) priceMultiplier *= 1.0;
        else if (age < 20) priceMultiplier *= 0.9;
        else priceMultiplier *= 0.8;
      }
      
      // Итоговая цена
      calculatedPrice = Math.round(avgPricePerSq * Number(area) * priceMultiplier);
    } else {
      // Если нет похожих объектов, используем стандартные цены по районам
      const basePrices = {
        'Есиль': 550000,
        'Алматы': 450000,
        'Сарыарка': 400000,
        'Байконур': 420000,
        'Нура-Есиль': 480000
      };
      
      // Коэффициенты для типов недвижимости
      const typeMultipliers = {
        'apartment': 1,
        'house': 0.9,
        'commercial': 1.2
      };
      
      // Коэффициенты для состояния
      const conditionMultipliers = {
        'excellent': 1.15,
        'good': 1,
        'needs_repair': 0.8,
        'construction': 0.7
      };
      
      // Базовая цена за м²
      const basePrice = basePrices[district] || 450000;
      
      // Расчет с учетом всех коэффициентов
      calculatedPrice = Math.round(
        basePrice * 
        (typeMultipliers[propertyType] || 1) * 
        (conditionMultipliers[condition] || 1) * 
        Number(area)
      );
    }
    
    // Добавляем случайность для реалистичности
    const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
    const finalPrice = Math.round(calculatedPrice * randomFactor / 1000) * 1000;
    
    // Формируем ответ
    const priceResult = {
      success: true,
      price: finalPrice,
      pricePerSqMeter: Math.round(finalPrice / Number(area)),
      range: {
        min: Math.round(finalPrice * 0.9),
        max: Math.round(finalPrice * 1.1)
      }
    };
    
    return res.status(200).json(priceResult);
  } catch (error) {
    console.error('Error calculating price:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Ошибка при расчете стоимости' 
    });
  }
}; 