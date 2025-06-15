const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// Маршрут для отправки сообщения (публичный)
router.post('/', contactController.sendMessage);

// Маршруты для администратора (требуют аутентификации и прав администратора)
router.get('/', verifyToken, isAdmin, contactController.getAllMessages);
router.get('/:id', verifyToken, isAdmin, contactController.getMessageById);
router.put('/:id/mark-read', verifyToken, isAdmin, contactController.markAsRead);
router.post('/:id/reply', verifyToken, isAdmin, contactController.replyToMessage);
router.delete('/:id', verifyToken, isAdmin, contactController.deleteMessage);

module.exports = router; 