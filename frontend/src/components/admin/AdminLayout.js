import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Grid, Container } from '@mui/material';
import AdminNavigation from './AdminNavigation';

/**
 * Компонент макета для страниц администратора
 * Включает боковую навигацию и область для контента
 */
const AdminLayout = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Боковая навигация */}
        <Grid item xs={12} md={3} lg={2.5}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            <AdminNavigation />
          </Box>
        </Grid>
        
        {/* Основной контент */}
        <Grid item xs={12} md={9} lg={9.5}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminLayout; 