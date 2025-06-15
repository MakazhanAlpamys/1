import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Landscape as LandscapeIcon,
  MonetizationOn as MoneyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useContext(AuthContext);
  
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [searchParams, setSearchParams] = useState({
    type: 'sale',
    propertyType: 'apartment',
    district: '',
    minPrice: '',
    maxPrice: ''
  });
  
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const res = await axios.get(`${API_URL}/properties?limit=4&sortBy=createdAt&sortOrder=DESC`);
        setFeaturedProperties(res.data.properties);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
      }
    };
    
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${API_URL}/expert/districts`);
        setDistricts(res.data.districts);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    
    fetchFeaturedProperties();
    fetchDistricts();
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Build search query
    const queryParams = new URLSearchParams();
    
    if (searchParams.type) queryParams.append('type', searchParams.type);
    if (searchParams.propertyType) queryParams.append('propertyType', searchParams.propertyType);
    if (searchParams.district) queryParams.append('district', searchParams.district);
    if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
    
    // Navigate to properties page with search params
    window.location.href = `/properties?${queryParams.toString()}`;
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 8,
          pb: 6,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1296&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            RealNest
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="inherit"
            paragraph
            sx={{ maxWidth: '800px', mx: 'auto', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            Найдите недвижимость своей мечты в Астане.
            Покупка, продажа или аренда - у нас есть идеальный вариант для вас.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/properties"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                mr: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              Просмотреть объекты
            </Button>
            <Button
              component={RouterLink}
              to="/contact"
              variant="outlined"
              size="large"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Связаться с нами
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Search Box */}
      <Container maxWidth="md" sx={{ mt: -5, position: 'relative' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="I want to"
                  name="type"
                  value={searchParams.type}
                  onChange={handleSearchChange}
                  variant="outlined"
                >
                  <MenuItem value="sale">Купить</MenuItem>
                  <MenuItem value="rent">Арендовать</MenuItem>
                  <MenuItem value="sell">Продать</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Тип недвижимости"
                  name="propertyType"
                  value={searchParams.propertyType}
                  onChange={handleSearchChange}
                  variant="outlined"
                >
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="land">Land</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="District"
                  name="district"
                  value={searchParams.district}
                  onChange={handleSearchChange}
                  variant="outlined"
                >
                  <MenuItem value="">Any District</MenuItem>
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Price from"
                  name="minPrice"
                  type="number"
                  value={searchParams.minPrice}
                  onChange={handleSearchChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₸</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: '100%', minHeight: '56px' }}
                >
                  <SearchIcon />
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      {/* Featured Properties */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Избранные объекты
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Ознакомьтесь с нашими последними и эксклюзивными предложениями недвижимости в Астане
        </Typography>
        
        <Grid container spacing={4}>
          {featuredProperties.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={property.images && property.images.length > 0 
                    ? `http://localhost:5000/${property.images[0].imageUrl}`
                    : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={property.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {property.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {property.district}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ₸ {property.price.toLocaleString()}
                    {property.type === 'rent' ? ' /month' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {property.area} m²
                    </Typography>
                    {property.rooms && (
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        {property.rooms} rooms
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink}
                    to={`/properties/${property.id}`}
                    color="primary"
                  >
                    Смотреть подробнее
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            component={RouterLink}
            to="/properties"
            variant="outlined"
            color="primary"
            size="large"
          >
            Просмотреть все объекты
          </Button>
        </Box>
      </Container>

      {/* Why Choose Us */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Почему выбирают RealNest
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Мы стремимся предоставить лучший опыт работы с недвижимостью
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <MoneyIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Лучшие цены
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Мы предлагаем самые конкурентоспособные цены на недвижимость в Астане с прозрачным ценообразованием.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <StarIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Премиум выбор
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Наш портфель включает только тщательно отобранные премиальные объекты недвижимости.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SpeedIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Быстрый процесс
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Мы оптимизируем процесс покупки, продажи и аренды для быстрого оформления сделок.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Безопасность и надежность
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Все транзакции и документы на недвижимость проверяются для вашей безопасности.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Property Types */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Найдите свою недвижимость
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Исследуйте различные типы недвижимости, доступные в Астане
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card component={RouterLink} to="/properties?propertyType=apartment" sx={{ textDecoration: 'none' }}>
              <CardMedia
                component="img"
                height={isMobile ? 150 : 200}
                image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                alt="Квартиры"
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <ApartmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Квартиры
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card component={RouterLink} to="/properties?propertyType=house" sx={{ textDecoration: 'none' }}>
              <CardMedia
                component="img"
                height={isMobile ? 150 : 200}
                image="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                alt="Дома"
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <HomeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Дома
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card component={RouterLink} to="/properties?propertyType=commercial" sx={{ textDecoration: 'none' }}>
              <CardMedia
                component="img"
                height={isMobile ? 150 : 200}
                image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Коммерческая недвижимость"
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Коммерческая
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card component={RouterLink} to="/properties?propertyType=land" sx={{ textDecoration: 'none' }}>
              <CardMedia
                component="img"
                height={isMobile ? 150 : 200}
                image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80"
                alt="Земельные участки"
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <LandscapeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Земельные участки
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h4" gutterBottom>
            Готовы найти идеальную недвижимость?
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
            Покупаете ли вы, арендуете или продаете недвижимость в Астане,
            RealNest поможет вам на каждом этапе.
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/properties"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mx: 1, mb: { xs: 2, sm: 0 } }}
            >
              Просмотреть объекты
            </Button>
            {!isAuthenticated() && (
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                size="large"
                sx={{ 
                  mx: 1,
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Зарегистрироваться
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 