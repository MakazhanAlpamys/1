import React, { useState, useContext } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  MapsHomeWork as MapsHomeWorkIcon,
  Phone as PhoneIcon,
  CalculateOutlined as CalculateOutlinedIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const location = useLocation();
  
  // Состояние для мобильного меню
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Состояние для меню пользователя
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    handleMobileMenuClose();
  };
  
  // Проверка активного маршрута
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  // Навигационные ссылки
  const navLinks = [
    { text: 'Главная', path: '/', icon: <HomeIcon /> },
    { text: 'Недвижимость', path: '/properties', icon: <MapsHomeWorkIcon /> },
    { text: 'Эксперт', path: '/expert', icon: <CalculateOutlinedIcon /> },
    { text: 'Контакты', path: '/contact', icon: <PhoneIcon /> },
  ];

  return (
    <>
      <AppBar 
        position="static" 
        color="default" 
        elevation={1}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Логотип для всех экранов */}
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 'bold',
                color: 'primary.main',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <BusinessIcon sx={{ mr: 1 }} />
              RealNest
            </Typography>

            {/* Бургер для мобильных */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                color="inherit"
                onClick={handleMobileMenuToggle}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Навигационные ссылки для десктопов */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map((link) => (
                <Button
                  key={link.text}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    mx: 1,
                    color: isActive(link.path) ? 'primary.main' : 'text.primary',
                    fontWeight: isActive(link.path) ? 'bold' : 'normal',
                    borderBottom: isActive(link.path) ? 2 : 0,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.text}
                </Button>
              ))}
            </Box>

            {/* Кнопки авторизации/профиля */}
            {!isAuthenticated ? (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Войти
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{ ml: 1 }}
                >
                  Регистрация
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/properties/add"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
                >
                  Добавить объявление
                </Button>

                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    p: 0,
                    border: '2px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Avatar 
                    sx={{ bgcolor: 'primary.main' }}
                    alt={user?.firstName || 'User'}
                    src={user?.avatar || ''}
                  >
                    {user?.firstName ? user.firstName[0] : <PersonIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile"
                    onClick={handleUserMenuClose}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Профиль
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/my-properties"
                    onClick={handleUserMenuClose}
                  >
                    <ListItemIcon>
                      <MapsHomeWorkIcon fontSize="small" />
                    </ListItemIcon>
                    Мои объявления
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem 
                      component={RouterLink} 
                      to="/admin"
                      onClick={handleUserMenuClose}
                    >
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      Панель администратора
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Выйти
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Мобильное меню */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280 
          },
        }}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              RealNest
            </Typography>
          </Box>
          <Divider />
          
          {/* Основное меню */}
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={link.path}
                  selected={isActive(link.path)}
                  onClick={handleMobileMenuClose}
                >
                  <ListItemText 
                    primary={link.text}
                    primaryTypographyProps={{
                      fontWeight: isActive(link.path) ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          {/* Меню пользователя */}
          {isAuthenticated ? (
            <>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/properties/add"
                    onClick={handleMobileMenuClose}
                  >
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText primary="Добавить объявление" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/profile"
                    onClick={handleMobileMenuClose}
                  >
                    <PersonIcon sx={{ mr: 2 }} />
                    <ListItemText primary="Профиль" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/my-properties"
                    onClick={handleMobileMenuClose}
                  >
                    <MapsHomeWorkIcon sx={{ mr: 2 }} />
                    <ListItemText primary="Мои объявления" />
                  </ListItemButton>
                </ListItem>
                {user?.role === 'admin' && (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to="/admin"
                      onClick={handleMobileMenuClose}
                    >
                      <DashboardIcon sx={{ mr: 2 }} />
                      <ListItemText primary="Панель администратора" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    <ListItemText primary="Выход" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          ) : (
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={handleMobileMenuClose}
                >
                  <ListItemText primary="Войти" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/register"
                  onClick={handleMobileMenuClose}
                >
                  <ListItemText primary="Регистрация" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar; 