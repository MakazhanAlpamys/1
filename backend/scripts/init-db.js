const { pool, initDatabase } = require('../database');
const bcrypt = require('bcryptjs');

// Функция для создания администратора по умолчанию
const createDefaultAdmin = async () => {
  try {
    // Проверка, есть ли уже пользователи в системе
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    
    if (userCount === 0) {
      console.log('Создание администратора по умолчанию...');
      
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Создание администратора
      await pool.query(
        'INSERT INTO users (firstName, lastName, email, password, role, "isActive") VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin', 'User', 'admin@realnest.kz', hashedPassword, 'admin', true]
      );
      
      console.log('Администратор по умолчанию успешно создан.');
    } else {
      console.log('Пропуск создания администратора, пользователи уже существуют.');
    }
  } catch (error) {
    console.error('Ошибка при создании администратора по умолчанию:', error);
  }
};

// Функция для создания тестовых данных
const createTestData = async () => {
  try {
    // Проверка, есть ли уже объекты недвижимости в системе
    const propertiesResult = await pool.query('SELECT COUNT(*) FROM properties');
    const propertyCount = parseInt(propertiesResult.rows[0].count);
    
    if (propertyCount === 0) {
      console.log('Создание тестовых объектов недвижимости...');
      
      // Получение ID администратора
      const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@realnest.kz']);
      
      if (adminResult.rows.length > 0) {
        const adminId = adminResult.rows[0].id;
        
        // Создание тестовых объектов недвижимости
        const testProperties = [
          {
            title: 'Современная квартира в центре города',
            description: 'Просторная квартира с современным ремонтом в самом центре города. Отличный вид из окна, развитая инфраструктура.',
            price: 25000000,
            address: 'ул. Достык, 12',
            city: 'Астана',
            district: 'Есильский',
            type: 'apartment',
            category: 'sale',
            bedrooms: 2,
            bathrooms: 1,
            area: 75.5,
            features: ['{"balcony", "parking", "security"}'],
            main_image: '/uploads/properties/apartment1.jpg',
            images: ['{"apartment1.jpg", "apartment1-2.jpg", "apartment1-3.jpg"}'],
            user_id: adminId
          },
          {
            title: 'Уютный дом для большой семьи',
            description: 'Двухэтажный дом с гаражом и садом. Идеально подходит для большой семьи. Тихий район, рядом школа и детский сад.',
            price: 45000000,
            address: 'ул. Абая, 45',
            city: 'Астана',
            district: 'Алматинский',
            type: 'house',
            category: 'sale',
            bedrooms: 4,
            bathrooms: 2,
            area: 180,
            features: ['{"garden", "garage", "fireplace"}'],
            main_image: '/uploads/properties/house1.jpg',
            images: ['{"house1.jpg", "house1-2.jpg", "house1-3.jpg"}'],
            user_id: adminId
          },
          {
            title: 'Квартира в аренду на длительный срок',
            description: 'Сдается квартира в новом жилом комплексе. Полностью меблирована, есть вся необходимая техника.',
            price: 150000,
            address: 'ул. Сауран, 7',
            city: 'Астана',
            district: 'Есильский',
            type: 'apartment',
            category: 'rent',
            bedrooms: 1,
            bathrooms: 1,
            area: 45,
            features: ['{"furnished", "appliances", "heating"}'],
            main_image: '/uploads/properties/apartment2.jpg',
            images: ['{"apartment2.jpg", "apartment2-2.jpg"}'],
            user_id: adminId
          }
        ];
        
        // Вставка тестовых объектов недвижимости в базу данных
        for (const property of testProperties) {
          await pool.query(
            `INSERT INTO properties (
              title, description, price, address, city, district, type, category,
              bedrooms, bathrooms, area, features, main_image, images, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              property.title, property.description, property.price, property.address,
              property.city, property.district, property.type, property.category,
              property.bedrooms, property.bathrooms, property.area, property.features,
              property.main_image, property.images, property.user_id
            ]
          );
        }
        
        console.log('Тестовые объекты недвижимости успешно созданы.');
      }
    } else {
      console.log('Пропуск создания тестовых данных, объекты недвижимости уже существуют.');
    }
  } catch (error) {
    console.error('Ошибка при создании тестовых данных:', error);
  }
};

// Основная функция инициализации
const initialize = async () => {
  try {
    // Инициализация базы данных (создание таблиц)
    await initDatabase();
    
    // Создание администратора по умолчанию
    await createDefaultAdmin();
    
    // Создание тестовых данных
    await createTestData();
    
    console.log('Инициализация базы данных завершена успешно.');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
};

// Запуск инициализации
initialize(); 