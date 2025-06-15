import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const MyPropertiesPage = () => {
  // User context is needed for authentication status
  const { isAuthenticated } = useContext(AuthContext);
  
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  // Status toggle state
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/properties/user/my-properties`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setProperties(res.data.properties);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Ошибка при загрузке объявлений');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  // Delete property
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    setDeleteInProgress(true);
    
    try {
      await axios.delete(`${API_URL}/properties/${propertyToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove from list
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      setDeleteInProgress(false);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Ошибка при удалении объявления');
      setDeleteInProgress(false);
    }
  };
  
  // Open delete dialog
  const openDeleteDialog = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };
  
  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };
  
  // Toggle property status (active/inactive)
  const togglePropertyStatus = async (property) => {
    setStatusUpdateLoading(true);
    
    try {
      const newStatus = property.isActive ? false : true;
      
      await axios.patch(
        `${API_URL}/properties/${property.id}/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update in list
      setProperties(properties.map(p => 
        p.id === property.id ? { ...p, isActive: newStatus } : p
      ));
      
      setStatusUpdateLoading(false);
    } catch (err) {
      console.error('Error updating property status:', err);
      setError('Ошибка при изменении статуса объявления');
      setStatusUpdateLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Filter properties by tab
  const filteredProperties = () => {
    if (tabValue === 0) return properties;
    return properties.filter(p => tabValue === 1 ? p.isActive : !p.isActive);
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Мои объявления
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/properties/add"
        >
          Добавить объявление
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {properties.length === 0 ? (
        <Paper elevation={0} variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            У вас пока нет объявлений
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Создайте свое первое объявление для продажи или аренды недвижимости
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/properties/add"
            sx={{ mt: 2 }}
          >
            Добавить объявление
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Все" />
              <Tab label="Активные" />
              <Tab label="Неактивные" />
            </Tabs>
          </Box>
          
          <Grid container spacing={3}>
            {filteredProperties().map((property) => (
              <Grid item key={property.id} xs={12} sm={6} md={4}>
                <Card elevation={0} variant="outlined">
                  <CardMedia
                    component="img"
                    height="160"
                    image={property.images && property.images.length > 0 
                      ? `http://localhost:5000${property.images[0].imageUrl}`
                      : 'https://via.placeholder.com/300x200?text=Нет+фото'}
                    alt={property.title}
                  />
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                        {property.title}
                      </Typography>
                      <Chip 
                        label={property.isActive ? 'Активно' : 'Неактивно'}
                        color={property.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {property.district}, {property.address && property.address.length > 30 ? `${property.address.substring(0, 30)}...` : property.address || 'Адрес не указан'}
                    </Typography>
                    <Typography variant="body1" color="primary" fontWeight="bold">
                      ₸ {property.price.toLocaleString()}
                      {property.type === 'rent' ? ' /месяц' : ''}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {property.type === 'rent' ? 'Аренда' : 'Продажа'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Создано: {formatDate(property.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Tooltip title="Просмотреть">
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={RouterLink}
                        to={`/properties/${property.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={RouterLink}
                        to={`/properties/${property.id}/edit`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDeleteDialog(property)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title={property.isActive ? 'Деактивировать' : 'Активировать'}>
                      <IconButton 
                        size="small"
                        color={property.isActive ? 'default' : 'success'}
                        onClick={() => togglePropertyStatus(property)}
                        disabled={statusUpdateLoading}
                      >
                        {property.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Удалить объявление
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить объявление "{propertyToDelete?.title}"?
            Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeDeleteDialog} 
            disabled={deleteInProgress}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteProperty} 
            color="error" 
            variant="contained"
            disabled={deleteInProgress}
          >
            {deleteInProgress ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyPropertiesPage; 