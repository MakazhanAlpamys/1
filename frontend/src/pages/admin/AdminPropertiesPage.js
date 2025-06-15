import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [actionType, setActionType] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Загрузка объявлений
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/properties`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      
      if (res.data && res.data.properties) {
        setProperties(res.data.properties);
        setTotalCount(res.data.totalCount || 0);
        setError(null);
      } else {
        setProperties([]);
        setTotalCount(0);
        setError('Не удалось загрузить данные объявлений');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Не удалось загрузить объявления');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, rowsPerPage, fetchProperties]);

  // Обработка изменения страницы
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Обработка изменения количества строк на странице
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Открытие диалога для действия
  const handleOpenDialog = (property, action) => {
    setCurrentProperty(property);
    setActionType(action);
    setRejectReason('');
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentProperty(null);
    setActionType('');
    setRejectReason('');
  };

  // Получение цвета для статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'sold':
        return 'primary';
      case 'rented':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Получение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'inactive':
        return 'Неактивно';
      case 'sold':
        return 'Продано';
      case 'rented':
        return 'Сдано';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <Container sx={{ py: 4, bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление объявлениями
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ bgcolor: 'white' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Объявления не найдены
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f0f2f5' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Заголовок</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Район</TableCell>
                    <TableCell>Цена</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} hover>
                      <TableCell>{property.id}</TableCell>
                      <TableCell>{property.title}</TableCell>
                      <TableCell>
                        {property.type === 'sale' ? 'Продажа' : 'Аренда'} / {property.propertyType}
                      </TableCell>
                      <TableCell>{property.district}</TableCell>
                      <TableCell>{property.price?.toLocaleString() || 0} ₸</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(property.status)} 
                          color={getStatusColor(property.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Н/Д'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          component={RouterLink} 
                          to={`/properties/${property.id}`}
                          title="Просмотр"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success" 
                          onClick={() => handleOpenDialog(property, 'approve')}
                          title="Одобрить"
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="warning" 
                          onClick={() => handleOpenDialog(property, 'reject')}
                          title="Отклонить"
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDialog(property, 'delete')}
                          title="Удалить"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`}
            />
          </>
        )}
      </Paper>

      {/* Диалоговые окна для действий */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'approve' && 'Одобрить объявление'}
          {actionType === 'reject' && 'Отклонить объявление'}
          {actionType === 'delete' && 'Удалить объявление'}
        </DialogTitle>
        <DialogContent>
          {currentProperty && (
            <>
              <DialogContentText>
                {actionType === 'approve' && 'Вы уверены, что хотите одобрить это объявление?'}
                {actionType === 'reject' && 'Пожалуйста, укажите причину отклонения объявления:'}
                {actionType === 'delete' && `Вы уверены, что хотите удалить объявление "${currentProperty.title}"? Это действие нельзя отменить.`}
              </DialogContentText>
              
              {actionType === 'reject' && (
                <TextField
                  autoFocus
                  margin="dense"
                  id="reason"
                  label="Причина отклонения"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={() => {
              // Здесь будет логика обработки действия
              handleCloseDialog();
            }} 
            color={actionType === 'delete' ? 'error' : actionType === 'reject' ? 'warning' : 'primary'}
            variant="contained"
            autoFocus
          >
            {actionType === 'approve' && 'Одобрить'}
            {actionType === 'reject' && 'Отклонить'}
            {actionType === 'delete' && 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPropertiesPage; 