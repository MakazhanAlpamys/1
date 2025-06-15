import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Pagination,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  InputAdornment,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  AspectRatio as AreaIcon,
  Bathtub as BathroomIcon,
  Hotel as BedroomIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const PropertiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  // Get search params from URL
  const queryParams = new URLSearchParams(location.search);
  
  // State for properties
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [districts, setDistricts] = useState([]);
  
  // State for filters
  const [filters, setFilters] = useState({
    type: queryParams.get('type') || 'all',
    propertyType: queryParams.get('propertyType') || 'all',
    district: queryParams.get('district') || 'all',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    minArea: queryParams.get('minArea') || '',
    maxArea: queryParams.get('maxArea') || '',
    rooms: queryParams.get('rooms') || 'all'
  });
  
  // State for filter visibility on mobile
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.propertyType !== 'all') params.append('propertyType', filters.propertyType);
        if (filters.district !== 'all') params.append('district', filters.district);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.minArea) params.append('minArea', filters.minArea);
        if (filters.maxArea) params.append('maxArea', filters.maxArea);
        if (filters.rooms !== 'all') params.append('rooms', filters.rooms);
        
        params.append('page', currentPage);
        params.append('limit', 12);
        
        const res = await axios.get(`${API_URL}/properties?${params.toString()}`);
        
        setProperties(res.data.properties);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Ошибка загрузки объектов недвижимости');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentPage, filters]);
  
  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${API_URL}/expert/districts`);
        setDistricts(res.data.districts);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    
    fetchDistricts();
  }, []);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters({
      ...filters,
      [name]: value
    });
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  
  // Apply filters
  const applyFilters = () => {
    // Update URL with filters
    const params = new URLSearchParams();
    
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.propertyType !== 'all') params.append('propertyType', filters.propertyType);
    if (filters.district !== 'all') params.append('district', filters.district);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minArea) params.append('minArea', filters.minArea);
    if (filters.maxArea) params.append('maxArea', filters.maxArea);
    if (filters.rooms !== 'all') params.append('rooms', filters.rooms);
    
    navigate(`/properties?${params.toString()}`);
  };
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      propertyType: 'all',
      district: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      rooms: 'all'
    });
    
    navigate('/properties');
  };
  
  // Toggle filter visibility on mobile
  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Найти недвижимость
      </Typography>
      
      {!isAuthenticated() && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для размещения объявлений необходимо <RouterLink to="/login">войти</RouterLink> или <RouterLink to="/register">зарегистрироваться</RouterLink>
        </Alert>
      )}
      
      {/* Mobile filter toggle */}
      <Box sx={{ display: { md: 'none' }, mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          onClick={toggleFilters}
          fullWidth
        >
          {filterVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid 
          item 
          xs={12} 
          md={3} 
          sx={{ 
            display: { 
              xs: filterVisible ? 'block' : 'none', 
              md: 'block' 
            } 
          }}
        >
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Фильтры
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Тип предложения</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Тип предложения"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="sale">Продажа</MenuItem>
                <MenuItem value="rent">Аренда</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Тип недвижимости</InputLabel>
              <Select
                name="propertyType"
                value={filters.propertyType}
                label="Тип недвижимости"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="apartment">Квартира</MenuItem>
                <MenuItem value="house">Дом</MenuItem>
                <MenuItem value="commercial">Коммерческая</MenuItem>
                <MenuItem value="land">Земельный участок</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Район</InputLabel>
              <Select
                name="district"
                value={filters.district}
                label="Район"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Все районы</MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Количество комнат</InputLabel>
              <Select
                name="rooms"
                value={filters.rooms}
                label="Количество комнат"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Любое</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4+</MenuItem>
              </Select>
            </FormControl>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Цена от"
                  name="minPrice"
                  type="number"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Цена до"
                  name="maxPrice"
                  type="number"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Площадь от"
                  name="minArea"
                  type="number"
                  value={filters.minArea}
                  onChange={handleFilterChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">м²</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Площадь до"
                  name="maxArea"
                  type="number"
                  value={filters.maxArea}
                  onChange={handleFilterChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">м²</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  onClick={applyFilters}
                  startIcon={<SearchIcon />}
                >
                  Найти
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={clearFilters}
                >
                  Очистить
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Properties list */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : properties.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Объекты недвижимости не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Попробуйте изменить параметры поиска
              </Typography>
              <Button 
                variant="contained" 
                onClick={clearFilters}
                sx={{ mt: 2 }}
              >
                Сбросить фильтры
              </Button>
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Найдено: {properties.length} объектов
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Сортировка</InputLabel>
                  <Select
                    value="newest"
                    label="Сортировка"
                  >
                    <MenuItem value="newest">Сначала новые</MenuItem>
                    <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
                    <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
                    <MenuItem value="area_asc">Площадь: по возрастанию</MenuItem>
                    <MenuItem value="area_desc">Площадь: по убыванию</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Grid container spacing={2}>
                {properties.map((property) => (
                  <Grid item key={property.id} xs={12} sm={6} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={property.images && property.images.length > 0 
                          ? `http://localhost:5000${property.images[0].imageUrl}`
                          : 'https://via.placeholder.com/300x200?text=Нет+фото'}
                        alt={property.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {property.title}
                          </Typography>
                          <Chip 
                            label={property.type === 'rent' ? 'Аренда' : property.type === 'sell' ? 'Продажа' : 'Купить'} 
                            color={property.type === 'rent' ? 'secondary' : 'primary'} 
                            size="small" 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {property.district}, {property.address}
                        </Typography>
                        
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                          ₸ {property.price.toLocaleString()}
                          {property.type === 'rent' ? ' /месяц' : ''}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AreaIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {property.area} м²
                          </Typography>
                          
                          {property.rooms && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <BedroomIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {property.rooms} {property.rooms === 1 ? 'комната' : property.rooms < 5 ? 'комнаты' : 'комнат'}
                            </Typography>
                          )}
                          
                          {property.bathrooms && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <BathroomIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {property.bathrooms} {property.bathrooms === 1 ? 'санузел' : 'санузла'}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                        <Button 
                          component={RouterLink}
                          to={`/properties/${property.id}`}
                          variant="outlined" 
                          fullWidth
                        >
                          Подробнее
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertiesPage; 