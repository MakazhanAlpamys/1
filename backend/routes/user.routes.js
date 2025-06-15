const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Profile update validation
const profileUpdateValidation = [
  body('first_name').notEmpty().withMessage('Имя обязательно'),
  body('last_name').notEmpty().withMessage('Фамилия обязательна'),
  body('phone').optional()
];

// Password change validation
const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
  body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов')
];

// Update profile
router.put('/profile', verifyToken, profileUpdateValidation, userController.updateUserProfile);

// Change password
router.put('/password', verifyToken, passwordChangeValidation, userController.changePassword);

// Get user profile
router.get('/profile', verifyToken, userController.getUserProfile);

module.exports = router; 