const bcrypt = require('bcryptjs');
const { pool } = require('../database');

// Получение профиля текущего пользователя
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false, 
        message: 'Пользователь не найден'
      });
    }
    
    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля пользователя'
    });
  }
};

// Обновление профиля пользователя
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { first_name, last_name, phone } = req.body;
    
    // Проверка наличия обязательных полей
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Имя и фамилия обязательны для заполнения'
      });
    }
    
    // Обновление данных пользователя
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, first_name, last_name, email, phone, role, is_active, created_at',
      [first_name, last_name, phone, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Профиль успешно обновлен',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля пользователя'
    });
  }
};

// Изменение пароля пользователя
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Проверка наличия обязательных полей
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Текущий и новый пароли обязательны для заполнения'
      });
    }
    
    // Проверка минимальной длины пароля
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Новый пароль должен содержать не менее 6 символов'
      });
    }
    
    // Получение текущего пароля пользователя
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    const user = userResult.rows[0];
    
    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный текущий пароль'
      });
    }
    
    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновление пароля
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при изменении пароля'
    });
  }
}; 