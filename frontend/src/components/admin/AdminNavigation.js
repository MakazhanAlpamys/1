import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Message as MessageIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Компонент навигации для панели администратора
 */
const AdminNavigation = () => {
  const location = useLocation();
  
  // Массив пунктов меню
  const menuItems = [
    {
      text: 'Панель управления',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      text: 'Пользователи',
      icon: <PeopleIcon />,
      path: '/admin/users'
    },
    {
      text: 'Объекты недвижимости',
      icon: <HomeIcon />,
      path: '/admin/properties'
    },
    {
      text: 'Сообщения',
      icon: <MessageIcon />,
      path: '/admin/messages'
    },
    {
      text: 'Настройки',
      icon: <SettingsIcon />,
      path: '/admin/settings'
    }
  ];

  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        height: '100%',
        borderRadius: 2
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="subtitle1" 
          fontWeight="bold" 
          color="primary"
          sx={{ mb: 1 }}
        >
          Панель администратора
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav">
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
            sx={{ 
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminNavigation; 