const fs = require('fs');
const path = require('path');
const { pool } = require('../database');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deactivating yourself
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }
    
    await user.update({ isActive: !user.isActive });
    
    res.json({
      success: true,
      message: user.isActive 
        ? 'User account activated successfully' 
        : 'User account deactivated successfully',
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error in toggleUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

// Delete user and all their properties
exports.deleteUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Проверка существования пользователя
    const checkQuery = `SELECT id FROM users WHERE id = $1`;
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Запрет на удаление своего аккаунта
    if (parseInt(id) === req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете удалить свой собственный аккаунт'
      });
    }
    
    // Получение всех изображений объектов недвижимости пользователя
    const imagesQuery = `
      SELECT pi.image_url
      FROM property_images pi
      JOIN properties p ON pi.property_id = p.id
      WHERE p.user_id = $1
    `;
    
    const imagesResult = await client.query(imagesQuery, [id]);
    
    // Удаление пользователя (каскадное удаление объектов недвижимости и изображений)
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    // Удаление файлов изображений
    imagesResult.rows.forEach(image => {
      const imagePath = path.join(__dirname, '..', 'public', image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Пользователь и все связанные данные успешно удалены'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error in deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении пользователя'
    });
  } finally {
    client.release();
  }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    // Формирование условий поиска
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        subject ILIKE $${paramIndex} OR 
        message ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status && ['new', 'read', 'responded'].includes(status)) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Формирование WHERE части запроса
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Вычисление смещения на основе страницы и лимита
    const offset = (page - 1) * limit;

    // Получение общего количества контактов
    const countQuery = `
      SELECT COUNT(*) FROM contacts
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Получение контактов с пагинацией
    const contactsQuery = `
      SELECT * FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const contactsResult = await pool.query(contactsQuery, queryParams);

    return res.status(200).json({
      success: true,
      contacts: contactsResult.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAllContacts:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении списка контактов'
    });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимое значение статуса'
      });
    }
    
    const checkQuery = `SELECT id FROM contacts WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Контакт не найден'
      });
    }
    
    const updateQuery = `
      UPDATE contacts 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status
    `;
    
    const updateResult = await pool.query(updateQuery, [status, id]);
    
    return res.status(200).json({
      success: true,
      message: 'Статус контакта успешно обновлен',
      contact: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error in updateContactStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении статуса контакта'
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Получение количества пользователей
    const userCountQuery = 'SELECT COUNT(*) FROM users';
    const userCountResult = await pool.query(userCountQuery);
    const userCount = parseInt(userCountResult.rows[0].count);
    
    // Получение количества объектов недвижимости
    const propertyCountQuery = 'SELECT COUNT(*) FROM properties';
    const propertyCountResult = await pool.query(propertyCountQuery);
    const propertyCount = parseInt(propertyCountResult.rows[0].count);
    
    // Получение количества новых сообщений
    const newMessagesQuery = "SELECT COUNT(*) FROM contacts WHERE status = 'new'";
    const newMessagesResult = await pool.query(newMessagesQuery);
    const newMessagesCount = parseInt(newMessagesResult.rows[0].count);
    
    // Получение количества объектов недвижимости по типам
    const propertiesByTypeQuery = `
      SELECT property_type, COUNT(*) as count
      FROM properties
      GROUP BY property_type
    `;
    const propertiesByTypeResult = await pool.query(propertiesByTypeQuery);
    
    // Получение количества объектов недвижимости по районам
    const propertiesByDistrictQuery = `
      SELECT district, COUNT(*) as count
      FROM properties
      GROUP BY district
      ORDER BY count DESC
      LIMIT 5
    `;
    const propertiesByDistrictResult = await pool.query(propertiesByDistrictQuery);
    
    // Получение количества новых пользователей и объектов за последний месяц
    const lastMonthQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users,
        (SELECT COUNT(*) FROM properties WHERE created_at >= NOW() - INTERVAL '30 days') as new_properties
    `;
    const lastMonthResult = await pool.query(lastMonthQuery);
    
    return res.status(200).json({
      success: true,
      stats: {
        userCount,
        propertyCount,
        newMessagesCount,
        propertiesByType: propertiesByTypeResult.rows,
        propertiesByDistrict: propertiesByDistrictResult.rows,
        lastMonth: lastMonthResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статистики'
    });
  }
};

// Получение всех пользователей с пагинацией
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    // Формирование условий поиска
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Формирование WHERE части запроса
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Вычисление смещения на основе страницы и лимита
    const offset = (page - 1) * limit;

    // Получение общего количества пользователей
    const countQuery = `
      SELECT COUNT(*) FROM users
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Получение пользователей с пагинацией
    const usersQuery = `
      SELECT 
        id, first_name, last_name, email, phone, role, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const usersResult = await pool.query(usersQuery, queryParams);

    return res.status(200).json({
      success: true,
      users: usersResult.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении списка пользователей'
    });
  }
};

// Получение пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, first_name, last_name, email, phone, role, is_active, created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
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
    console.error('Error in getUserById:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении данных пользователя'
    });
  }
};

// Переключение статуса активности пользователя
exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверка существования пользователя
    const checkQuery = `SELECT id, is_active FROM users WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    const user = checkResult.rows[0];
    
    // Запрет на деактивацию своего аккаунта
    if (user.id === req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете деактивировать свой собственный аккаунт'
      });
    }
    
    // Обновление статуса активности
    const newStatus = !user.is_active;
    
    const updateQuery = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, is_active
    `;
    
    const updateResult = await pool.query(updateQuery, [newStatus, id]);
    
    return res.status(200).json({
      success: true,
      message: newStatus 
        ? 'Аккаунт пользователя успешно активирован' 
        : 'Аккаунт пользователя успешно деактивирован',
      user: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error in toggleUserActive:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении статуса пользователя'
    });
  }
};

// Переключение роли администратора
exports.toggleUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверка существования пользователя
    const checkQuery = `SELECT id, role FROM users WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    const user = checkResult.rows[0];
    
    // Запрет на изменение роли своего аккаунта
    if (user.id === req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Вы не можете изменить роль своего собственного аккаунта'
      });
    }
    
    // Обновление роли
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    const updateQuery = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, role
    `;
    
    const updateResult = await pool.query(updateQuery, [newRole, id]);
    
    return res.status(200).json({
      success: true,
      message: newRole === 'admin' 
        ? 'Пользователю успешно назначены права администратора' 
        : 'У пользователя успешно отозваны права администратора',
      user: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error in toggleUserAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении роли пользователя'
    });
  }
}; 