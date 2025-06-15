const fs = require('fs');
const path = require('path');
const { pool } = require('../database');

// Получение всех объектов недвижимости с фильтрами
exports.getAllProperties = async (req, res) => {
  try {
    const {
      type, // 'sale' или 'rent'
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      district,
      rooms,
      propertyType, // 'apartment', 'house', 'commercial', 'land'
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Формирование условий поиска
    let whereConditions = ['status = $1'];
    let queryParams = ['active'];
    let paramIndex = 2;

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (propertyType) {
      whereConditions.push(`property_type = $${paramIndex}`);
      queryParams.push(propertyType);
      paramIndex++;
    }

    if (district) {
      whereConditions.push(`district = $${paramIndex}`);
      queryParams.push(district);
      paramIndex++;
    }

    if (rooms) {
      whereConditions.push(`rooms = $${paramIndex}`);
      queryParams.push(rooms);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`price >= $${paramIndex}`);
      queryParams.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`price <= $${paramIndex}`);
      queryParams.push(maxPrice);
      paramIndex++;
    }

    if (minArea) {
      whereConditions.push(`area >= $${paramIndex}`);
      queryParams.push(minArea);
      paramIndex++;
    }

    if (maxArea) {
      whereConditions.push(`area <= $${paramIndex}`);
      queryParams.push(maxArea);
      paramIndex++;
    }

    // Формирование WHERE части запроса
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Вычисление смещения на основе страницы и лимита
    const offset = (page - 1) * limit;

    // Получение общего количества объектов
    const countQuery = `
      SELECT COUNT(*) FROM properties
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Получение объектов недвижимости с пагинацией
    const propertiesQuery = `
      SELECT 
        p.id, p.title, p.description, p.type, p.property_type, p.price, 
        p.area, p.rooms, p.bathrooms, p.address, p.district, 
        p.latitude, p.longitude, p.contact_phone, p.contact_email, 
        p.status, p.year_built, p.user_id, p.created_at, p.updated_at,
        u.first_name, u.last_name, u.email,
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          ))
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS images
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const propertiesResult = await pool.query(propertiesQuery, queryParams);

    // Вычисление общего количества страниц
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      count: totalCount,
      totalPages,
      currentPage: parseInt(page),
      properties: propertiesResult.rows
    });
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении объектов недвижимости'
    });
  }
};

// Получение одного объекта недвижимости по ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.id, p.title, p.description, p.type, p.property_type, p.price, 
        p.area, p.rooms, p.bathrooms, p.address, p.district, 
        p.latitude, p.longitude, p.contact_phone, p.contact_email, 
        p.status, p.year_built, p.user_id, p.created_at, p.updated_at,
        u.first_name, u.last_name, u.email,
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          ))
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS images
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден'
      });
    }

    return res.status(200).json({
      success: true,
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении объекта недвижимости'
    });
  }
};

// Создание нового объекта недвижимости
exports.createProperty = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      title,
      description,
      type,
      propertyType,
      price,
      area,
      rooms,
      bathrooms,
      address,
      district,
      latitude,
      longitude,
      contactPhone,
      contactEmail,
      yearBuilt
    } = req.body;

    // Проверка обязательных полей
    if (!title || !description || !type || !propertyType || !price || !area || !address || !district || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Не все обязательные поля заполнены'
      });
    }

    // Создание объекта недвижимости
    const propertyQuery = `
      INSERT INTO properties (
        title, description, type, property_type, price, area, rooms, bathrooms,
        address, district, latitude, longitude, contact_phone, contact_email, year_built, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, title, description, type, property_type, price, area
    `;
    
    const propertyResult = await client.query(propertyQuery, [
      title,
      description,
      type,
      propertyType,
      price,
      area,
      rooms || null,
      bathrooms || null,
      address,
      district,
      latitude || null,
      longitude || null,
      contactPhone,
      contactEmail || null,
      yearBuilt || null,
      req.userId
    ]);

    const property = propertyResult.rows[0];

    // Обработка загруженных изображений, если есть
    if (req.files && req.files.length > 0) {
      const propertyImages = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const relativePath = `uploads/properties/${file.filename}`;
        
        const imageQuery = `
          INSERT INTO property_images (property_id, image_url, is_primary)
          VALUES ($1, $2, $3)
          RETURNING id, image_url, is_primary
        `;
        
        const imageResult = await client.query(imageQuery, [
          property.id,
          relativePath,
          i === 0 // Первое изображение - основное по умолчанию
        ]);
        
        propertyImages.push(imageResult.rows[0]);
      }
      
      property.images = propertyImages;
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Объект недвижимости успешно создан',
      property
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createProperty:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании объекта недвижимости'
    });
  } finally {
    client.release();
  }
};

// Обновление объекта недвижимости
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      propertyType,
      price,
      area,
      rooms,
      bathrooms,
      address,
      district,
      latitude,
      longitude,
      contactPhone,
      contactEmail,
      yearBuilt,
      status
    } = req.body;

    // Проверка существования объекта и прав доступа
    const checkQuery = `
      SELECT user_id FROM properties WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден'
      });
    }
    
    const property = checkResult.rows[0];
    
    // Проверка, является ли пользователь владельцем объекта или администратором
    if (property.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для редактирования этого объекта'
      });
    }

    // Обновление объекта недвижимости
    const updateQuery = `
      UPDATE properties
      SET 
        title = $1,
        description = $2,
        type = $3,
        property_type = $4,
        price = $5,
        area = $6,
        rooms = $7,
        bathrooms = $8,
        address = $9,
        district = $10,
        latitude = $11,
        longitude = $12,
        contact_phone = $13,
        contact_email = $14,
        year_built = $15,
        status = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING id, title, description, type, property_type, price, area, status
    `;
    
    const updateResult = await pool.query(updateQuery, [
      title,
      description,
      type,
      propertyType,
      price,
      area,
      rooms || null,
      bathrooms || null,
      address,
      district,
      latitude || null,
      longitude || null,
      contactPhone,
      contactEmail || null,
      yearBuilt || null,
      status || 'active',
      id
    ]);

    return res.status(200).json({
      success: true,
      message: 'Объект недвижимости успешно обновлен',
      property: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error in updateProperty:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении объекта недвижимости'
    });
  }
};

// Удаление объекта недвижимости
exports.deleteProperty = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Проверка существования объекта и прав доступа
    const checkQuery = `
      SELECT user_id FROM properties WHERE id = $1
    `;
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден'
      });
    }
    
    const property = checkResult.rows[0];
    
    // Проверка, является ли пользователь владельцем объекта или администратором
    if (property.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для удаления этого объекта'
      });
    }
    
    // Получение изображений для удаления файлов
    const imagesQuery = `
      SELECT image_url FROM property_images WHERE property_id = $1
    `;
    const imagesResult = await client.query(imagesQuery, [id]);
    
    // Удаление изображений из базы данных
    await client.query('DELETE FROM property_images WHERE property_id = $1', [id]);
    
    // Удаление объекта недвижимости
    await client.query('DELETE FROM properties WHERE id = $1', [id]);
    
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
      message: 'Объект недвижимости успешно удален',
      propertyId: id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteProperty:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении объекта недвижимости'
    });
  } finally {
    client.release();
  }
};

// Добавление изображений к объекту недвижимости
exports.addPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверка существования объекта и прав доступа
    const checkQuery = `
      SELECT user_id FROM properties WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден'
      });
    }
    
    const property = checkResult.rows[0];
    
    // Проверка, является ли пользователь владельцем объекта или администратором
    if (property.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для добавления изображений к этому объекту'
      });
    }
    
    // Проверка наличия загруженных файлов
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Нет загруженных изображений'
      });
    }
    
    // Проверка, есть ли уже основное изображение
    const primaryCheckQuery = `
      SELECT COUNT(*) FROM property_images WHERE property_id = $1 AND is_primary = true
    `;
    const primaryCheckResult = await pool.query(primaryCheckQuery, [id]);
    const hasPrimary = parseInt(primaryCheckResult.rows[0].count) > 0;
    
    // Добавление изображений
    const addedImages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = `uploads/properties/${file.filename}`;
      
      const imageQuery = `
        INSERT INTO property_images (property_id, image_url, is_primary)
        VALUES ($1, $2, $3)
        RETURNING id, image_url, is_primary
      `;
      
      const isPrimary = !hasPrimary && i === 0; // Первое изображение основное, только если нет других основных
      
      const imageResult = await pool.query(imageQuery, [id, relativePath, isPrimary]);
      addedImages.push(imageResult.rows[0]);
    }

    return res.status(200).json({
      success: true,
      message: 'Изображения успешно добавлены',
      images: addedImages
    });
  } catch (error) {
    console.error('Error in addPropertyImages:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при добавлении изображений'
    });
  }
};

// Удаление изображения объекта недвижимости
exports.deletePropertyImage = async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    
    // Проверка существования объекта и прав доступа
    const checkQuery = `
      SELECT p.user_id, pi.image_url, pi.is_primary
      FROM properties p
      JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = $1 AND pi.id = $2
    `;
    const checkResult = await pool.query(checkQuery, [propertyId, imageId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Изображение или объект недвижимости не найдены'
      });
    }
    
    const { user_id, image_url, is_primary } = checkResult.rows[0];
    
    // Проверка, является ли пользователь владельцем объекта или администратором
    if (user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав для удаления изображений этого объекта'
      });
    }
    
    // Удаление изображения из базы данных
    await pool.query('DELETE FROM property_images WHERE id = $1', [imageId]);
    
    // Если удаляемое изображение было основным, назначаем новое основное изображение
    if (is_primary) {
      const newPrimaryQuery = `
        UPDATE property_images
        SET is_primary = true
        WHERE property_id = $1
        ORDER BY id
        LIMIT 1
      `;
      await pool.query(newPrimaryQuery, [propertyId]);
    }
    
    // Удаление файла изображения
    const imagePath = path.join(__dirname, '..', 'public', image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    return res.status(200).json({
      success: true,
      message: 'Изображение успешно удалено',
      imageId
    });
  } catch (error) {
    console.error('Error in deletePropertyImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении изображения'
    });
  }
};

// Получение объектов недвижимости текущего пользователя
exports.getUserProperties = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    
    // Вычисление смещения на основе страницы и лимита
    const offset = (page - 1) * limit;
    
    // Получение общего количества объектов пользователя
    const countQuery = `
      SELECT COUNT(*) FROM properties WHERE user_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Получение объектов недвижимости пользователя с пагинацией
    const propertiesQuery = `
      SELECT 
        p.id, p.title, p.description, p.type, p.property_type, p.price, 
        p.area, p.status, p.created_at,
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          ))
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS images
      FROM properties p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const propertiesResult = await pool.query(propertiesQuery, [userId, limit, offset]);
    
    // Вычисление общего количества страниц
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      count: totalCount,
      totalPages,
      currentPage: parseInt(page),
      properties: propertiesResult.rows
    });
  } catch (error) {
    console.error('Error in getUserProperties:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении объектов недвижимости пользователя'
    });
  }
}; 