import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
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
  IconButton,
  Alert,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  Collapse
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Загрузка сообщений
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      setMessages(res.data.messages);
      setTotalCount(res.data.totalCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, rowsPerPage, statusFilter]);

  // Обработка изменения страницы
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Обработка изменения количества строк на странице
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Обработка поиска
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  // Открытие диалога для действия
  const handleOpenDialog = (message, action) => {
    setCurrentMessage(message);
    setActionType(action);
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentMessage(null);
    setActionType('');
  };

  // Открытие диалога для ответа
  const handleOpenReplyDialog = (message) => {
    setCurrentMessage(message);
    setReplyText('');
    setReplyDialogOpen(true);
  };

  // Закрытие диалога для ответа
  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setCurrentMessage(null);
    setReplyText('');
  };

  // Отправка ответа на сообщение
  const handleSendReply = async () => {
    if (!currentMessage || !replyText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/messages/${currentMessage.id}/reply`,
        { replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновление списка сообщений
      fetchMessages();
      handleCloseReplyDialog();
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Не удалось отправить ответ');
    }
  };

  // Выполнение действия (пометка как прочитанное, удаление)
  const handleAction = async () => {
    if (!currentMessage) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (actionType === 'mark-read') {
        await axios.put(
          `${API_URL}/admin/messages/${currentMessage.id}/mark-read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else if (actionType === 'delete') {
        await axios.delete(
          `${API_URL}/admin/messages/${currentMessage.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      // Обновление списка сообщений
      fetchMessages();
      handleCloseDialog();
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Не удалось выполнить действие');
    }
  };

  // Переключение развернутого сообщения
  const toggleExpandMessage = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление сообщениями
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Фильтры и поиск */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Поиск по имени, email или содержанию сообщения..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        type="submit"
                        variant="contained" 
                        size="small"
                      >
                        Найти
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Статус"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="all">Все сообщения</MenuItem>
              <MenuItem value="unread">Непрочитанные</MenuItem>
              <MenuItem value="read">Прочитанные</MenuItem>
              <MenuItem value="replied">С ответом</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%"></TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Тема</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <React.Fragment key={message.id}>
                        <TableRow 
                          sx={{ 
                            backgroundColor: message.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => toggleExpandMessage(message.id)}
                            >
                              {expandedMessageId === message.id ? 
                                <ExpandLessIcon fontSize="small" /> : 
                                <ExpandMoreIcon fontSize="small" />
                              }
                            </IconButton>
                          </TableCell>
                          <TableCell>{message.name}</TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell>
                            {new Date(message.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                message.repliedAt ? 'Отвечено' : 
                                message.isRead ? 'Прочитано' : 'Новое'
                              } 
                              color={
                                message.repliedAt ? 'success' : 
                                message.isRead ? 'default' : 'primary'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {!message.isRead && (
                              <IconButton 
                                color="primary" 
                                size="small" 
                                title="Отметить как прочитанное"
                                onClick={() => handleOpenDialog(message, 'mark-read')}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            )}
                            
                            <IconButton 
                              color="primary" 
                              size="small" 
                              title="Ответить"
                              onClick={() => handleOpenReplyDialog(message)}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                            
                            <IconButton 
                              color="error" 
                              size="small" 
                              title="Удалить"
                              onClick={() => handleOpenDialog(message, 'delete')}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        
                        {/* Развернутое содержимое сообщения */}
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expandedMessageId === message.id} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Сообщение:
                                </Typography>
                                <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                                  {message.message}
                                </Typography>
                                
                                {message.repliedAt && (
                                  <>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                      Ответ ({new Date(message.repliedAt).toLocaleDateString()}):
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {message.replyText}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          Сообщения не найдены
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
            />
          </>
        )}
      </Paper>
      
      {/* Диалог подтверждения действия */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'mark-read' && 'Отметить как прочитанное'}
          {actionType === 'delete' && 'Удалить сообщение'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'mark-read' && 'Вы уверены, что хотите отметить это сообщение как прочитанное?'}
            {actionType === 'delete' && 'Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleAction} 
            color={actionType === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            {actionType === 'mark-read' && 'Отметить'}
            {actionType === 'delete' && 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог для ответа на сообщение */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={handleCloseReplyDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Ответ на сообщение</DialogTitle>
        <DialogContent>
          {currentMessage && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  От: {currentMessage.name} ({currentMessage.email})
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Тема: {currentMessage.subject}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                  {currentMessage.message}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                label="Ваш ответ"
                placeholder="Введите текст ответа..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog}>Отмена</Button>
          <Button 
            onClick={handleSendReply} 
            color="primary"
            variant="contained"
            disabled={!replyText.trim()}
          >
            Отправить ответ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminMessagesPage; 