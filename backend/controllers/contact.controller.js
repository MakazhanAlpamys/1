const { pool } = require('../database');
const nodemailer = require('nodemailer');

// Отправка сообщения от пользователя
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Валидация
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо заполнить все обязательные поля'
      });
    }

    // Создание записи в базе данных
    const result = await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, subject, created_at',
      [name, email, phone || null, subject, message, 'new']
    );

    const contact = result.rows[0];

    // Отправка уведомления администратору (можно реализовать позже)
    // await sendNotificationEmail(contact);

    return res.status(201).json({ 
      success: true,
      message: 'Сообщение успешно отправлено',
      contact
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при отправке сообщения'
    });
  }
};

// Получение всех сообщений (для администратора)
exports.getAllMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

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
    
    // Фильтрация по статусу
    if (status === 'new') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push('new');
      paramIndex++;
    } else if (status === 'read') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push('read');
      paramIndex++;
    } else if (status === 'responded') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push('responded');
      paramIndex++;
    }

    // Формирование WHERE части запроса
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Получение общего количества сообщений
    const countQuery = `
      SELECT COUNT(*) FROM contacts
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Получение сообщений с пагинацией
    const messagesQuery = `
      SELECT * FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const messagesResult = await pool.query(messagesQuery, queryParams);

    return res.status(200).json({
      success: true,
      messages: messagesResult.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при получении сообщений'
    });
  }
};

// Получение одного сообщения по ID (для администратора)
exports.getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [messageId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    return res.status(200).json({
      success: true,
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting message by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при получении сообщения'
    });
  }
};

// Отметка сообщения как прочитанное (для администратора)
exports.markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const checkResult = await pool.query('SELECT id FROM contacts WHERE id = $1', [messageId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    await pool.query(
      'UPDATE contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['read', messageId]
    );
    
    return res.status(200).json({ 
      success: true,
      message: 'Сообщение отмечено как прочитанное',
      contactId: messageId
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса сообщения'
    });
  }
};

// Ответ на сообщение (для администратора)
exports.replyToMessage = async (req, res) => {
  try {
    const { replyText } = req.body;
    const messageId = req.params.id;
    
    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: 'Текст ответа не может быть пустым'
      });
    }
    
    const checkResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [messageId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    const message = checkResult.rows[0];
    
    // Обновление сообщения в базе данных
    await pool.query(
      'UPDATE contacts SET reply = $1, replied_at = CURRENT_TIMESTAMP, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [replyText, 'responded', messageId]
    );
    
    // Отправка ответа по email
    try {
      await sendReplyEmail(message, replyText);
    } catch (emailError) {
      console.error('Error sending reply email:', emailError);
      // Продолжаем выполнение, даже если email не отправлен
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Ответ успешно отправлен',
      contact: {
        id: messageId,
        name: message.name,
        email: message.email,
        subject: message.subject,
        repliedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при отправке ответа'
    });
  }
};

// Удаление сообщения (для администратора)
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const checkResult = await pool.query('SELECT id FROM contacts WHERE id = $1', [messageId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Сообщение не найдено'
      });
    }
    
    await pool.query('DELETE FROM contacts WHERE id = $1', [messageId]);
    
    return res.status(200).json({ 
      success: true,
      message: 'Сообщение успешно удалено',
      contactId: messageId
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при удалении сообщения'
    });
  }
};

// Функция отправки ответа по email
const sendReplyEmail = async (message, replyText) => {
  // Проверка наличия настроек SMTP в переменных окружения
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error('SMTP настройки не сконфигурированы');
  }
  
  // Создание транспорта для отправки email
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === '465',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  
  // Формирование и отправка email
  await transporter.sendMail({
    from: `"RealNest" <${smtpUser}>`,
    to: message.email,
    subject: `Re: ${message.subject}`,
    text: `Здравствуйте, ${message.name}!\n\n${replyText}\n\nС уважением,\nКоманда RealNest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a6da7;">Ответ на ваше обращение в RealNest</h2>
        <p>Здравствуйте, <strong>${message.name}</strong>!</p>
        <p>Вы писали нам: <em>"${message.subject}"</em></p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #4a6da7; margin: 20px 0;">
          ${replyText.replace(/\n/g, '<br>')}
        </div>
        <p>С уважением,<br>Команда RealNest</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
        </div>
      </div>
    `
  });
}; 