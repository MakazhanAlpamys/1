import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        pt: 6,
        pb: 2,
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              <Typography 
                variant="h5" 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  textDecoration: 'none'
                }}
              >
                RealNest
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              RealNest — ваш надежный партнер в мире недвижимости. Удобный поиск, 
              продажа и аренда квартир, домов и коммерческих объектов в Астане.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton size="small" color="primary" aria-label="facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="linkedin">
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Навигация
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Главная
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties" color="inherit" underline="hover">
                  Недвижимость
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/expert" color="inherit" underline="hover">
                  Эксперт
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
                  Контакты
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Property Types */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Категории
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties?type=sale" color="inherit" underline="hover">
                  Продажа
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties?type=rent" color="inherit" underline="hover">
                  Аренда
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties?propertyType=apartment" color="inherit" underline="hover">
                  Квартиры
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties?propertyType=house" color="inherit" underline="hover">
                  Дома
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1.5 }}>
                <Link component={RouterLink} to="/properties?propertyType=commercial" color="inherit" underline="hover">
                  Коммерческая
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Контактная информация
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  пр. Кабанбай батыра 53, Астана, Казахстан
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PhoneIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Link href="tel:+77001234567" color="inherit" underline="hover">
                  +7 (700) 123-45-67
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EmailIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Link href="mailto:info@realnest.kz" color="inherit" underline="hover">
                  info@realnest.kz
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Copyright and links */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align={isMobile ? "center" : "left"}
            sx={{ mb: { xs: 2, sm: 0 } }}
          >
            © {currentYear} RealNest. Все права защищены.
          </Typography>
          
          <Box>
            <Link href="#" color="text.secondary" underline="hover" sx={{ mx: 1 }}>
              Условия использования
            </Link>
            <Link href="#" color="text.secondary" underline="hover" sx={{ mx: 1 }}>
              Политика конфиденциальности
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 