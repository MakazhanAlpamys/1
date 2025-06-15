import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Страница не найдена
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Запрашиваемая страница не существует или была перемещена.
      </Typography>
      <Box mt={4}>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          startIcon={<HomeIcon />}
        >
          Вернуться на главную
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 