import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Landscape as LandscapeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

// Компонент экспертной зоны
const ExpertPage = () => {
  // Состояния для калькулятора стоимости
  const [propertyType, setPropertyType] = useState('apartment');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('1');
  const [yearBuilt, setYearBuilt] = useState('');
  const [condition, setCondition] = useState('good');
  const [districts, setDistricts] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Загрузка списка районов при монтировании компонента
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`${API_URL}/expert/districts`);
        setDistricts(response.data.districts || []);
        
        // Устанавливаем первый район из списка по умолчанию
        if (response.data.districts && response.data.districts.length > 0) {
          setDistrict(response.data.districts[0]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке районов:', error);
      }
    };
    
    fetchDistricts();
  }, []);

  // Функция для расчета стоимости
  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!district || !area) {
      return;
    }
    
    setCalculating(true);
    setCalculationResult(null);
    
    try {
      const response = await axios.post(`${API_URL}/expert/calculate-price`, {
        propertyType,
        district,
        area: parseFloat(area),
        rooms,
        yearBuilt,
        condition
      });
      
      setCalculationResult(response.data);
    } catch (error) {
      console.error('Ошибка при расчете стоимости:', error);
    } finally {
      setCalculating(false);
    }
  };
  
  // Функция для сброса формы калькулятора
  const handleReset = () => {
    setPropertyType('apartment');
    setArea('');
    setRooms('1');
    setYearBuilt('');
    setCondition('good');
    setCalculationResult(null);
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Экспертная зона
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Используйте наши инструменты для оценки недвижимости
        </Typography>
      </Box>
      
      <Grid container spacing={4} justifyContent="center">
        {/* Калькулятор стоимости недвижимости */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalculateIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Калькулятор стоимости недвижимости
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Рассчитайте примерную рыночную стоимость объекта
              </Typography>
              
              <Box component="form" onSubmit={handleCalculate} noValidate>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Тип недвижимости
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button 
                      variant={propertyType === 'apartment' ? 'contained' : 'outlined'} 
                      startIcon={<ApartmentIcon />}
                      onClick={() => setPropertyType('apartment')}
                      size="small"
                    >
                      Квартира
                    </Button>
                    <Button 
                      variant={propertyType === 'house' ? 'contained' : 'outlined'}
                      startIcon={<HomeIcon />}
                      onClick={() => setPropertyType('house')}
                      size="small"
                    >
                      Дом
                    </Button>
                    <Button 
                      variant={propertyType === 'commercial' ? 'contained' : 'outlined'}
                      startIcon={<BusinessIcon />}
                      onClick={() => setPropertyType('commercial')}
                      size="small"
                    >
                      Коммерческая
                    </Button>
                    <Button 
                      variant={propertyType === 'land' ? 'contained' : 'outlined'}
                      startIcon={<LandscapeIcon />}
                      onClick={() => setPropertyType('land')}
                      size="small"
                    >
                      Земля
                    </Button>
                  </Box>
                </Box>
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="district-label">Район</InputLabel>
                  <Select
                    labelId="district-label"
                    value={district}
                    label="Район"
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {districts.map((d, index) => (
                      <MenuItem key={index} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Площадь"
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">м²</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  {propertyType === 'apartment' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="rooms-label">Количество комнат</InputLabel>
                        <Select
                          labelId="rooms-label"
                          value={rooms}
                          label="Количество комнат"
                          onChange={(e) => setRooms(e.target.value)}
                        >
                          <MenuItem value="1">1 комната</MenuItem>
                          <MenuItem value="2">2 комнаты</MenuItem>
                          <MenuItem value="3">3 комнаты</MenuItem>
                          <MenuItem value="4">4 комнаты</MenuItem>
                          <MenuItem value="5">5+ комнат</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {propertyType !== 'land' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Год постройки"
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(e.target.value)}
                        placeholder={new Date().getFullYear().toString()}
                      />
                    </Grid>
                  )}
                  
                  {propertyType !== 'land' && (
                    <Grid item xs={12} sm={propertyType === 'land' ? 12 : 6}>
                      <FormControl fullWidth>
                        <InputLabel id="condition-label">Состояние</InputLabel>
                        <Select
                          labelId="condition-label"
                          value={condition}
                          label="Состояние"
                          onChange={(e) => setCondition(e.target.value)}
                        >
                          <MenuItem value="excellent">Отличное</MenuItem>
                          <MenuItem value="good">Хорошее</MenuItem>
                          <MenuItem value="needs_repair">Требует ремонта</MenuItem>
                          <MenuItem value="construction">Черновая отделка</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {propertyType === 'land' && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Для земельных участков оценка основана на районе расположения и площади.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={calculating ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    disabled={calculating || !district || !area}
                    sx={{ mr: 1 }}
                  >
                    {calculating ? 'Расчет...' : 'Рассчитать'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                  >
                    Сбросить
                  </Button>
                </Box>
              </Box>
              
              {calculationResult && calculationResult.success && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Результат оценки
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
                    <Typography variant="h4" component="div" color="primary.main">
                      {formatPrice(calculationResult.price)} ₸
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {formatPrice(calculationResult.pricePerSqMeter)} ₸/м²
                    </Typography>
                  </Paper>
                  <Typography variant="body2" color="text.secondary">
                    Диапазон цен: {formatPrice(calculationResult.range.min)} - {formatPrice(calculationResult.range.max)} ₸
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * Оценка основана на рыночных данных и носит информационный характер
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Полезные советы для покупателей и продавцов
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Как выбрать район?
                </Typography>
                <Typography variant="body2">
                  При выборе района обратите внимание на инфраструктуру, транспортную доступность, наличие школ и детских садов.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Проверка документов
                </Typography>
                <Typography variant="body2">
                  Перед покупкой недвижимости тщательно проверьте все документы, включая историю собственности и наличие обременений.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ипотечные программы
                </Typography>
                <Typography variant="body2">
                  Сравните предложения разных банков по ипотеке. Обратите внимание на процентную ставку, срок и дополнительные комиссии.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ExpertPage; 