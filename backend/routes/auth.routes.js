const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('first_name').notEmpty().withMessage('Имя обязательно'),
  body('last_name').notEmpty().withMessage('Фамилия обязательна'),
  body('email').isEmail().withMessage('Введите корректный адрес электронной почты'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('phone').optional()
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Введите корректный адрес электронной почты'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

// Register route
router.post('/register', registerValidation, authController.register);

// Login route
router.post('/login', loginValidation, authController.login);

// Get user profile
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router; 