const { pool } = require('../database');

/**
 * Middleware для проверки, является ли пользователь администратором
 */
exports.isAdmin = async (req, res, next) => {
  try {
    // Проверяем, что пользователь аутентифицирован (middleware auth.middleware должен быть применен перед этим)
    if (!req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    // Если в запросе уже есть роль пользователя (установлена в auth.middleware)
    if (req.userRole) {
      if (req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещен. Требуются права администратора'
        });
      }
      
      // Если пользователь администратор, продолжаем выполнение запроса
      return next();
    }

    // Если роли нет в запросе, получаем пользователя из базы данных
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );

    // Проверяем, существует ли пользователь
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const user = result.rows[0];

    // Проверяем, является ли пользователь администратором
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Требуются права администратора'
      });
    }

    // Если пользователь администратор, продолжаем выполнение запроса
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке прав администратора'
    });
  }
}; 