import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container sx={{ py: 4, bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                borderLeft: '4px solid #3f51b5',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Пользователей
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                borderLeft: '4px solid #f50057',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <BusinessIcon sx={{ fontSize: 40, color: '#f50057', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего объявлений
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                borderLeft: '4px solid #4caf50',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.activeProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Активных объявлений
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                borderLeft: '4px solid #ff9800',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CancelIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.pendingProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ожидающих модерации
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Последние действия
        </Typography>
        <Paper elevation={3} sx={{ p: 3, bgcolor: 'white' }}>
          <Typography variant="body1" color="text.secondary">
            Здесь будет отображаться история действий администраторов
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage; 