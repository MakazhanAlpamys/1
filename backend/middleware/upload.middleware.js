const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Проверка существования директории uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Проверка существования директории для изображений недвижимости
const propertyImagesDir = path.join(uploadsDir, 'properties');
if (!fs.existsSync(propertyImagesDir)) {
  fs.mkdirSync(propertyImagesDir, { recursive: true });
}

// Настройка хранилища для изображений недвижимости
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, propertyImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов - только изображения
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Не изображение! Пожалуйста, загружайте только изображения.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB лимит
  }
});

module.exports = {
  uploadPropertyImages: upload.array('images', 10) // Разрешить до 10 изображений
}; 