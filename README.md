# RealNest - Платформа для операций с недвижимостью

RealNest - это веб-платформа для поиска, продажи и аренды недвижимости в Астане, Казахстан.

## Технологии

### Бэкенд
- Node.js
- Express.js
- PostgreSQL
- JWT для аутентификации

### Фронтенд
- React
- Material UI
- React Router
- Context API

## Требования

- Node.js 14.x или выше
- PostgreSQL 12.x или выше

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/realnest.git
cd realnest
```

### 2. Настройка базы данных PostgreSQL

1. Установите PostgreSQL, если он еще не установлен
2. Создайте базу данных:

```bash
psql -U postgres
CREATE DATABASE realnest;
\q
```

### 3. Настройка бэкенда

1. Перейдите в директорию бэкенда:

```bash
cd backend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл .env с настройками:

```
# Настройки сервера
PORT=5000
NODE_ENV=development

# Настройки базы данных PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=realnest
DB_HOST=localhost
DB_PORT=5432

# Настройки JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

# Настройки для отправки email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=user@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=info@realnest.kz
```

4. Инициализируйте базу данных:

```bash
npm run init-db
```

5. Запустите сервер:

```bash
npm run dev
```

### 4. Настройка фронтенда

1. Перейдите в директорию фронтенда:

```bash
cd ../frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите приложение:

```bash
npm start
```

## Доступ к приложению

- Фронтенд: http://localhost:3000
- API бэкенда: http://localhost:5000/api

## Учетные записи по умолчанию

После инициализации базы данных будет создан администратор по умолчанию:

- Email: admin@realnest.kz
- Пароль: admin123

## Структура проекта

### Бэкенд

- `/controllers` - контроллеры для обработки запросов
- `/middleware` - промежуточное ПО для аутентификации и авторизации
- `/routes` - маршруты API
- `/scripts` - скрипты для инициализации и обслуживания
- `/public` - статические файлы и загрузки

### Фронтенд

- `/src/components` - компоненты React
- `/src/context` - контексты React для управления состоянием
- `/src/pages` - страницы приложения
- `/src/utils` - вспомогательные функции

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - регистрация нового пользователя
- `POST /api/auth/login` - вход пользователя
- `GET /api/auth/profile` - получение профиля текущего пользователя

### Пользователи

- `GET /api/users/profile` - получение профиля текущего пользователя
- `PUT /api/users/profile` - обновление профиля
- `PUT /api/users/password` - изменение пароля

### Недвижимость

- `GET /api/properties` - получение списка объектов недвижимости
- `GET /api/properties/:id` - получение информации об объекте
- `POST /api/properties` - создание нового объекта
- `PUT /api/properties/:id` - обновление объекта
- `DELETE /api/properties/:id` - удаление объекта

### Контакты

- `POST /api/contacts` - отправка контактного сообщения

### Администрирование

- `GET /api/admin/users` - получение списка пользователей
- `PUT /api/admin/users/:id/toggle-active` - блокировка/разблокировка пользователя
- `PUT /api/admin/users/:id/toggle-admin` - назначение/снятие прав администратора
- `DELETE /api/admin/users/:id` - удаление пользователя
- `GET /api/admin/dashboard/stats` - получение статистики для панели администратора