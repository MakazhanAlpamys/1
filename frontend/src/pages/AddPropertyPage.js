import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  MenuItem,
  Button,
  Paper,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
  Stack,
  Card,
  CardMedia,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const propertyTypes = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом' },
  { value: 'commercial', label: 'Коммерческая недвижимость' },
  { value: 'land', label: 'Земельный участок' },
];

const astanaDistricts = [
  'Алматы',
  'Байконур',
  'Есиль',
  'Сарыарка',
  'Нура-Есиль',
];

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    rooms: '',
    bathrooms: '',
    yearBuilt: '',
    address: '',
    district: '',
    propertyType: 'apartment',
    type: 'sale',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
  });

  // State for images
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // State for form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Check file types
    const validFiles = selectedFiles.filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
    );
    
    // Check if we have more than 10 images
    const totalImages = [...images, ...validFiles];
    if (totalImages.length > 10) {
      setError('Вы можете загрузить не более 10 изображений');
      return;
    }
    
    setImages([...images, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up URL object
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title) {
      setError('Заголовок обязателен');
      return false;
    }
    if (!formData.description) {
      setError('Описание обязательно');
      return false;
    }
    if (!formData.price) {
      setError('Цена обязательна');
      return false;
    }
    if (!formData.area) {
      setError('Площадь обязательна');
      return false;
    }
    if (!formData.address) {
      setError('Адрес обязателен');
      return false;
    }
    if (!formData.district) {
      setError('Район обязателен');
      return false;
    }
    if (!formData.contactPhone) {
      setError('Контактный телефон обязателен');
      return false;
    }
    if (images.length === 0) {
      setError('Добавьте хотя бы одно изображение');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data
      const propertyFormData = new FormData();
      
      // Add property data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          propertyFormData.append(key, formData[key]);
        }
      });
      
      // Add images
      images.forEach(image => {
        propertyFormData.append('images', image);
      });
      
      // Send request
      const response = await axios.post(
        `${API_URL}/properties`, 
        propertyFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate(`/properties/${response.data.property.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.response?.data?.message || 'Ошибка при создании объявления');
    } finally {
      setLoading(false);
    }
  };

  // Clean up URL objects when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Создать объявление
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Объявление успешно создано! Перенаправление...
          </Alert>
        )}
        
        {loading && <LinearProgress sx={{ mb: 3 }} />}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Заголовок объявления"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Тип объявления</FormLabel>
                  <RadioGroup 
                    row 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                  >
                    <FormControlLabel value="sale" control={<Radio />} label="Продажа" />
                    <FormControlLabel value="rent" control={<Radio />} label="Аренда" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Тип недвижимости"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {propertyTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Стоимость и характеристики
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Цена"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                  }}
                  helperText={formData.type === 'rent' ? "Цена за месяц" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Площадь"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">м²</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Количество комнат"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  disabled={loading || formData.propertyType === 'land'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Количество санузлов"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  disabled={loading || formData.propertyType === 'land'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Год постройки"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  disabled={loading || formData.propertyType === 'land'}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Расположение
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Адрес"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Район"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {astanaDistricts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Описание объекта
            </Typography>
            
            <TextField
              fullWidth
              required
              multiline
              rows={5}
              label="Подробное описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              helperText="Опишите все особенности, преимущества и состояние объекта"
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Фотографии
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Добавьте до 10 фотографий (JPEG, PNG, WEBP, макс. 5МБ каждая)
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{ mr: 1 }}
                disabled={loading || previews.length >= 10}
              >
                Добавить фото
                <input
                  hidden
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                {previews.length} из 10 фотографий
              </Typography>
            </Box>
            
            {previews.length > 0 && (
              <Grid container spacing={2}>
                {previews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={preview}
                        alt={`Фото ${index + 1}`}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Телефон"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="+7XXXXXXXXXX"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/properties')}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              Опубликовать объявление
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddPropertyPage; 