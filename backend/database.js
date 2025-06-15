const { Pool } = require('pg');
const dbConfig = require('./config/db.config');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Создание пула подключений к PostgreSQL
const pool = new Pool(dbConfig);

// Функция для проверки подключения к базе данных
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Успешное подключение к базе данных PostgreSQL');
    client.release();
    return true;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    return false;
  }
};

// Функция для инициализации базы данных (создание таблиц)
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Создание таблицы пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы недвижимости
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('sale', 'rent', 'sell')),
        property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'commercial', 'land')),
        price NUMERIC(12, 2) NOT NULL,
        area NUMERIC(10, 2) NOT NULL,
        rooms INTEGER,
        bathrooms INTEGER,
        address VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        latitude NUMERIC(10, 8),
        longitude NUMERIC(11, 8),
        contact_phone VARCHAR(20) NOT NULL,
        contact_email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented')),
        year_built INTEGER,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы изображений недвижимости
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы контактных сообщений
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
        reply TEXT,
        replied_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание администратора по умолчанию, если таблица пользователей пуста
    const adminCheck = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
    if (parseInt(adminCheck.rows[0].count) === 0) {
      // Хешируем пароль администратора
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Добавляем администратора
      await client.query(`
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin', 'RealNest', 'admin@realnest.kz', hashedPassword, 'admin']);
      
      console.log('Создан администратор по умолчанию (email: admin@realnest.kz, password: admin123)');
    }

    await client.query('COMMIT');
    console.log('База данных успешно инициализирована');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Экспорт модулей
module.exports = {
  pool,
  testConnection,
  initDatabase
}; 