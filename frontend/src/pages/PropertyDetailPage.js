import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AspectRatio as AreaIcon,
  Bathtub as BathroomIcon,
  Hotel as BedroomIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/properties/${id}`);
        setProperty(res.data.property);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Ошибка при загрузке информации о недвижимости');
        setLoading(false);
      }
    };
    
    fetchPropertyDetail();
  }, [id]);
  
  // Handle image dialog
  const handleOpenDialog = (index) => {
    setCurrentImage(index);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Button 
          component={RouterLink}
          to="/properties"
          variant="contained"
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Вернуться к списку
        </Button>
      </Container>
    );
  }
  
  // Render empty state
  if (!property) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="info">
          Объект недвижимости не найден
        </Alert>
        <Button 
          component={RouterLink}
          to="/properties"
          variant="contained"
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Вернуться к списку
        </Button>
      </Container>
    );
  }
  
  // Format price
  const formattedPrice = property.price.toLocaleString();
  const pricePerM2 = Math.round(property.price / property.area).toLocaleString();
  
  // Format property type
  const getPropertyTypeName = (type) => {
    const types = {
      'apartment': 'Квартира',
      'house': 'Дом',
      'commercial': 'Коммерческая недвижимость',
      'land': 'Земельный участок'
    };
    return types[type] || type;
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/properties"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          К списку объектов
        </Button>
        <Typography variant="body2" color="text.secondary">
          / {property.district} / {getPropertyTypeName(property.propertyType)}
        </Typography>
      </Box>
      
      {/* Property title and status */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mr: 2 }}>
            {property.title}
          </Typography>
          <Chip 
            label={property.type === 'rent' ? 'Аренда' : property.type === 'sell' ? 'Продажа' : 'Купить'} 
            color={property.type === 'rent' ? 'secondary' : 'primary'} 
          />
        </Box>
        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
          {property.district}, {property.address}
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Left column - images */}
        <Grid item xs={12} md={8}>
          {/* Main image */}
          {property.images && property.images.length > 0 ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                component="img"
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                src={`http://localhost:5000${property.images[0].imageUrl}`}
                alt={property.title}
                onClick={() => handleOpenDialog(0)}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Нет изображений
              </Typography>
            </Box>
          )}
          
          {/* Thumbnails */}
          {property.images && property.images.length > 1 && (
            <ImageList cols={isMobile ? 3 : 5} gap={8} sx={{ mb: 4 }}>
              {property.images.map((image, index) => (
                <ImageListItem 
                  key={image.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleOpenDialog(index)}
                >
                  <img
                    src={`http://localhost:5000${image.imageUrl}`}
                    alt={`${property.title} - фото ${index + 1}`}
                    loading="lazy"
                    style={{ 
                      height: '80px', 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
          
          {/* Description */}
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Описание
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <HomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Тип недвижимости" 
                      secondary={getPropertyTypeName(property.propertyType)} 
                    />
                  </ListItem>
                  {property.rooms && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <BedroomIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Комнат" 
                        secondary={property.rooms} 
                      />
                    </ListItem>
                  )}
                  {property.bathrooms && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <BathroomIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Санузлов" 
                        secondary={property.bathrooms} 
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AreaIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Площадь" 
                      secondary={`${property.area} м²`} 
                    />
                  </ListItem>
                  {property.yearBuilt && (
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DateIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Год постройки" 
                        secondary={property.yearBuilt} 
                      />
                    </ListItem>
                  )}
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Район" 
                      secondary={property.district} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Location */}
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Расположение
            </Typography>
            <Typography variant="body1" paragraph sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon fontSize="small" sx={{ mr: 1 }} />
              {property.address}
            </Typography>
            {/* Google Map iframe would go here */}
            <Box 
              sx={{ 
                width: '100%', 
                height: '300px', 
                bgcolor: 'grey.200', 
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Карта местоположения
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right column - price and contact info */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            {/* Price card */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                ₸ {formattedPrice}
                {property.type === 'rent' ? ' /месяц' : ''}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                ₸ {pricePerM2} за м²
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Property details */}
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Тип:
                  </Typography>
                  <Typography variant="body1">
                    {property.type === 'rent' ? 'Аренда' : 'Продажа'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Площадь:
                  </Typography>
                  <Typography variant="body1">
                    {property.area} м²
                  </Typography>
                </Grid>
                {property.rooms && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Комнат:
                    </Typography>
                    <Typography variant="body1">
                      {property.rooms}
                    </Typography>
                  </Grid>
                )}
                {property.bathrooms && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Санузлов:
                    </Typography>
                    <Typography variant="body1">
                      {property.bathrooms}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            {/* Contact card */}
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Контактная информация
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1">
                    {property.User ? `${property.User.firstName} ${property.User.lastName}` : 'Владелец'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Владелец объявления
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Телефон:
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  {property.contactPhone}
                </Typography>
              </Box>
              
              {property.contactEmail && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Email:
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    {property.contactEmail}
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {/* Similar properties would go here */}
          </Box>
        </Grid>
      </Grid>
      
      {/* Image dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {property.images && property.images.length > 0 && (
            <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>
              <img
                src={`http://localhost:5000${property.images[currentImage].imageUrl}`}
                alt={property.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                onClick={handleCloseDialog}
              >
                <CloseIcon />
              </IconButton>
              {property.images.length > 1 && (
                <>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                    onClick={handlePrevImage}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                    onClick={handleNextImage}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PropertyDetailPage; 