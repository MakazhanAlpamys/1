import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
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
  InputAdornment
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      setUsers(res.data.users);
      setTotalCount(res.data.totalCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, roleFilter, statusFilter, fetchUsers]);

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
    fetchUsers();
  };

  // Открытие диалога для действия
  const handleOpenDialog = (user, action) => {
    setCurrentUser(user);
    setActionType(action);
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentUser(null);
    setActionType('');
  };

  // Выполнение действия (блокировка/разблокировка, назначение админом, удаление)
  const handleAction = async () => {
    if (!currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (actionType === 'toggle-active') {
        await axios.put(
          `${API_URL}/admin/users/${currentUser.id}/toggle-active`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else if (actionType === 'toggle-admin') {
        await axios.put(
          `${API_URL}/admin/users/${currentUser.id}/toggle-admin`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else if (actionType === 'delete') {
        await axios.delete(
          `${API_URL}/admin/users/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      // Обновление списка пользователей
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Не удалось выполнить действие');
    }
  };

  return (
    <Container sx={{ py: 4, bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление пользователями
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Фильтры и поиск */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Поиск по имени, email или телефону..."
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
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Роль"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
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
              <MenuItem value="all">Все роли</MenuItem>
              <MenuItem value="user">Пользователи</MenuItem>
              <MenuItem value="admin">Администраторы</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
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
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="blocked">Заблокированные</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Таблица пользователей */}
      <Paper elevation={3} sx={{ bgcolor: 'white' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Пользователи не найдены
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f0f2f5' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата регистрации</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{`${user.first_name || 'undefined'} ${user.last_name || 'undefined'}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                          sx={{ 
                            fontWeight: user.role === 'admin' ? 'bold' : 'normal',
                            bgcolor: user.role === 'admin' ? '#3498db' : '#e0e0e0'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'Активен' : 'Заблокирован'}
                          color={user.is_active ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: user.is_active ? '#2ecc71' : '#e74c3c',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Invalid Date'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color={user.is_active ? 'error' : 'success'}
                          onClick={() => handleOpenDialog(user, 'toggle-active')}
                          title={user.is_active ? 'Заблокировать' : 'Разблокировать'}
                        >
                          {user.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(user, 'toggle-admin')}
                          title={user.role === 'admin' ? 'Снять права администратора' : 'Назначить администратором'}
                          sx={{ mx: 1 }}
                        >
                          <AdminIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDialog(user, 'delete')}
                          title="Удалить"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`}
            />
          </>
        )}
      </Paper>

      {/* Диалоговые окна для действий */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'toggle-active' && (currentUser?.is_active ? 'Заблокировать пользователя' : 'Разблокировать пользователя')}
          {actionType === 'toggle-admin' && (currentUser?.role === 'admin' ? 'Снять права администратора' : 'Назначить администратором')}
          {actionType === 'delete' && 'Удалить пользователя'}
        </DialogTitle>
        <DialogContent>
          {currentUser && (
            <DialogContentText>
              {actionType === 'toggle-active' && (
                currentUser.is_active 
                  ? `Вы уверены, что хотите заблокировать пользователя ${currentUser.first_name} ${currentUser.last_name} (${currentUser.email})?`
                  : `Вы уверены, что хотите разблокировать пользователя ${currentUser.first_name} ${currentUser.last_name} (${currentUser.email})?`
              )}
              {actionType === 'toggle-admin' && (
                currentUser.role === 'admin'
                  ? `Вы уверены, что хотите снять права администратора с пользователя ${currentUser.first_name} ${currentUser.last_name} (${currentUser.email})?`
                  : `Вы уверены, что хотите назначить пользователя ${currentUser.first_name} ${currentUser.last_name} (${currentUser.email}) администратором?`
              )}
              {actionType === 'delete' && `Вы уверены, что хотите удалить пользователя ${currentUser.first_name} ${currentUser.last_name} (${currentUser.email})? Это действие нельзя отменить.`}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleAction} 
            color={
              actionType === 'delete' ? 'error' : 
              actionType === 'toggle-active' ? (currentUser?.is_active ? 'error' : 'success') : 
              'primary'
            }
            variant="contained"
            autoFocus
          >
            {actionType === 'toggle-active' && (currentUser?.is_active ? 'Заблокировать' : 'Разблокировать')}
            {actionType === 'toggle-admin' && (currentUser?.role === 'admin' ? 'Снять права' : 'Назначить')}
            {actionType === 'delete' && 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage; 