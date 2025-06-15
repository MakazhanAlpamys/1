import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Container, Paper } from '@mui/material';

/**
 * Компонент защищенного маршрута для администраторов
 * Перенаправляет на страницу входа, если пользователь не авторизован
 * Показывает сообщение об отказе в доступе, если пользователь не является администратором
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь не является администратором, показываем сообщение об отказе в доступе
  if (!isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography variant="body1" color="text.secondary">
            У вас нет прав для доступа к этой странице. Данная страница доступна только для администраторов.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Если пользователь авторизован и является администратором, отображаем дочерние маршруты
  return <Outlet />;
};

export default AdminRoute; 