import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

// Ширина боковой панели
const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояние для управления меню
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Проверка текущего маршрута
  const isActive = (path) => location.pathname === path;
  
  // Обработчики для меню пользователя
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Выход из системы
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };
  
  // Переключение бокового меню
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Навигация для мобильных устройств
  const handleDrawerItemClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  // Пункты меню
  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Объявления', icon: <BusinessIcon />, path: '/admin/properties' },
    { text: 'Пользователи', icon: <PeopleIcon />, path: '/admin/users' },
  ];
  
  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: theme.palette.primary.dark,
        color: 'white'
      }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          RealNest Admin
        </Typography>
        {isMobile && (
          <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ backgroundColor: '#2c3e50', height: '100%', py: 2, color: '#ecf0f1' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ 
                display: 'block',
                mb: 1
              }}
            >
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive(item.path)}
                onClick={handleDrawerItemClick}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  mx: 1,
                  borderRadius: '8px',
                  color: '#ecf0f1',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(isActive(item.path) && {
                    backgroundColor: '#3498db',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2980b9',
                    }
                  }),
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0, 
                    mr: 2, 
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'white' : '#bdc3c7',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/"
              onClick={handleDrawerItemClick}
              sx={{ 
                minHeight: 48, 
                px: 2.5, 
                mx: 1, 
                borderRadius: '8px',
                color: '#ecf0f1',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center', color: '#bdc3c7' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="На главную" 
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ 
                minHeight: 48, 
                px: 2.5, 
                mx: 1, 
                borderRadius: '8px',
                color: '#ecf0f1',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center', color: '#bdc3c7' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Выход" 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#34495e',
          color: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ 
              mr: 2,
              display: { md: 'none' } 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' } 
            }}
          >
            Панель администратора
          </Typography>
          
          <Button 
            component={RouterLink}
            to="/"
            color="inherit"
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{ 
              mr: 2, 
              display: { xs: 'none', sm: 'flex' },
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            На сайт
          </Button>
          
          <IconButton onClick={handleMenuOpen} color="inherit">
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#3498db' 
              }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1, minWidth: 180 }
            }}
          >
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                handleLogout();
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Выйти</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            backgroundColor: '#2c3e50'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: '64px',
          backgroundColor: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 