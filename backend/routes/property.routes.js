const express = require('express');
const { body } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadPropertyImages } = require('../middleware/upload.middleware');

const router = express.Router();

// Property validation
const propertyValidation = [
  body('title').notEmpty().withMessage('Заголовок обязателен'),
  body('description').notEmpty().withMessage('Описание обязательно'),
  body('type').isIn(['sale', 'rent']).withMessage('Тип должен быть "sale" или "rent"'),
  body('propertyType').isIn(['apartment', 'house', 'commercial', 'land']).withMessage('Неверный тип недвижимости'),
  body('price').isNumeric().withMessage('Цена должна быть числом'),
  body('area').isNumeric().withMessage('Площадь должна быть числом'),
  body('rooms').optional().isInt().withMessage('Количество комнат должно быть целым числом'),
  body('bathrooms').optional().isInt().withMessage('Количество ванных комнат должно быть целым числом'),
  body('address').notEmpty().withMessage('Адрес обязателен'),
  body('district').notEmpty().withMessage('Район обязателен'),
  body('latitude').optional().isFloat().withMessage('Широта должна быть числом'),
  body('longitude').optional().isFloat().withMessage('Долгота должна быть числом'),
  body('contactPhone').notEmpty().withMessage('Контактный телефон обязателен'),
  body('contactEmail').optional().isEmail().withMessage('Контактный email должен быть корректным'),
  body('yearBuilt').optional().isInt().withMessage('Год постройки должен быть целым числом')
];

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/user/my-properties', verifyToken, propertyController.getUserProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (require authentication)
router.post('/', verifyToken, uploadPropertyImages, propertyValidation, propertyController.createProperty);
router.put('/:id', verifyToken, propertyValidation, propertyController.updateProperty);
router.delete('/:id', verifyToken, propertyController.deleteProperty);
router.post('/:id/images', verifyToken, uploadPropertyImages, propertyController.addPropertyImages);
router.delete('/:propertyId/images/:imageId', verifyToken, propertyController.deletePropertyImage);

module.exports = router; 