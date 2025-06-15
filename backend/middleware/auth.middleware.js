const jwt = require('jsonwebtoken');
const { pool } = require('../database');

/**
 * Middleware для проверки аутентификации пользователя
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Получение токена из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }
    
    // Извлечение токена
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Проверка существования пользователя
      const result = await pool.query(
        'SELECT id, email, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }
      
      const user = result.rows[0];
      
      // Проверка активности аккаунта
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Ваш аккаунт заблокирован'
        });
      }
      
      // Добавление данных пользователя в объект запроса
      req.userId = decoded.id;
      req.userEmail = user.email;
      req.userRole = user.role;
      
      // Переход к следующему middleware
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Срок действия токена истек'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке аутентификации'
    });
  }
}; 