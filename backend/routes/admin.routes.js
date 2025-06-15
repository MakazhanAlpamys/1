const express = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

// Применяем middleware проверки аутентификации и прав администратора ко всем маршрутам
router.use(verifyToken);
router.use(isAdmin);

// Управление пользователями
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);
router.put('/users/:id/toggle-admin', adminController.toggleUserAdmin);
router.delete('/users/:id', adminController.deleteUser);

// Управление контактами
router.get('/contacts', adminController.getAllContacts);
router.patch('/contacts/:id/status', adminController.updateContactStatus);

// Статистика для панели администратора
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router; 