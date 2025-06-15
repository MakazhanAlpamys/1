import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_URL}/contact`, formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
      console.error('Error submitting contact form:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Связаться с нами
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Контактная информация */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Наши контакты
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <LocationIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1">
                  Астана, Казахстан
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  пр. Мәңгілік Ел, 55/2
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <PhoneIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1">
                  +7 (7172) 123-456
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Пн-Пт, 9:00-18:00
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <EmailIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1">
                  info@realnest.kz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Отправьте нам email
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Форма обратной связи */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Отправить сообщение
            </Typography>
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Имя"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Тема"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Сообщение"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Отправить'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPage; 