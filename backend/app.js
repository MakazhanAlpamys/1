const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { testConnection, initDatabase } = require('./database');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const expertRoutes = require('./routes/expert.routes');

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создание директорий, если они не существуют
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Создана директория uploads');
}

const propertyImagesDir = path.join(uploadsDir, 'properties');
if (!fs.existsSync(propertyImagesDir)) {
  fs.mkdirSync(propertyImagesDir, { recursive: true });
  console.log('Создана директория для изображений недвижимости');
}

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/expert', expertRoutes);

// Базовый маршрут для проверки работы API
app.get('/', (req, res) => {
  res.json({
    message: 'RealNest API работает',
    version: '1.0.0'
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Произошла ошибка на сервере',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Инициализация базы данных и запуск сервера
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Проверка подключения к базе данных
    const connected = await testConnection();
    
    if (connected) {
      // Инициализация базы данных (создание таблиц)
      await initDatabase();
      
      // Запуск сервера
      app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
      });
    } else {
      console.error('Не удалось подключиться к базе данных. Сервер не запущен.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 