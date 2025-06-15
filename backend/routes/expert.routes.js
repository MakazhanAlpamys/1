const express = require('express');
const { body } = require('express-validator');
const expertController = require('../controllers/expertController');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Валидация для оценки стоимости недвижимости
const propertyValuationValidation = [
  body('district').notEmpty().withMessage('Район обязателен'),
  body('propertyType').isIn(['apartment', 'house', 'commercial', 'land']).withMessage('Неверный тип недвижимости'),
  body('area').isNumeric().withMessage('Площадь должна быть числом'),
  body('condition').optional().isIn(['excellent', 'good', 'needs_repair', 'construction']).withMessage('Неверное состояние')
];

// Получение списка районов
router.get('/districts', expertController.getDistricts);

// Расчет стоимости недвижимости
router.post('/calculate-price', propertyValuationValidation, expertController.calculatePrice);

module.exports = router; 