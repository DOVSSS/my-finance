import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const HomePage = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [families, setFamilies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Состояния для админ-функций
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Загрузка транзакций
    const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      let totalBalance = 0;
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        totalBalance += data.type === 'deposit' ? data.amount : -data.amount;
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        };
      });
      setTransactions(transactionsData);
      setBalance(totalBalance);
    });

    // Загрузка семей
    const familiesQuery = query(collection(db, 'families'), orderBy('createdAt'));
    const unsubscribeFamilies = onSnapshot(familiesQuery, (snapshot) => {
      const familiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFamilies(familiesData);
      setLoading(false);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeFamilies();
    };
  }, []);

  // Админ-функции
  const addFamily = async () => {
    if (!newFamilyName.trim()) return;
    
    try {
      await addDoc(collection(db, 'families'), {
        name: newFamilyName,
        members: [],
        createdAt: new Date().toISOString()
      });
      setNewFamilyName('');
      showSnackbar('Семья добавлена!', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при добавлении семьи', 'error');
    }
  };

  const addMember = async () => {
    if (!newMemberName.trim() || !selectedFamily) return;
    
    try {
      const familyRef = doc(db, 'families', selectedFamily);
      const family = families.find(f => f.id === selectedFamily);
      
      const updatedMembers = [
        ...(family.members || []),
        {
          name: newMemberName,
          paid: false,
          paymentDate: null
        }
      ];
      
      await updateDoc(familyRef, { members: updatedMembers });
      setNewMemberName('');
      showSnackbar('Участник добавлен!', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при добавлении участника', 'error');
    }
  };

 const togglePayment = async (familyId, memberIndex) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const family = families.find(f => f.id === familyId);
    
    if (!family || !family.members || !family.members[memberIndex]) {
      showSnackbar('Ошибка: участник не найден', 'error');
      return;
    }
    
    const member = family.members[memberIndex];
    const isNowPaid = !member.paid;
    const now = new Date();
    
    console.log('Изменяем статус участника:', {
      memberName: member.name,
      wasPaid: member.paid,
      willBePaid: isNowPaid
    });
    
    // Обновляем члена семьи - используем обычную дату вместо serverTimestamp()
    const updatedMembers = [...family.members];
    updatedMembers[memberIndex] = {
      ...member,
      paid: isNowPaid,
      paymentDate: isNowPaid ? now.toISOString() : null
    };
    
    console.log('Обновляем документ семьи:', familyId);
    await updateDoc(familyRef, { 
      members: updatedMembers 
    });
    
    // Если взнос помечен как оплаченный, добавляем транзакцию
    if (isNowPaid) {
      console.log('Добавляем транзакцию на 1000 ₽');
      
      try {
        const transactionData = {
          type: 'deposit',
          amount: 1000,
          memberName: member.name,
          familyName: family.name,
          description: 'Ежемесячный взнос',
          date: now, // Используем обычную дату
          timestamp: now.toISOString()
        };
        
        console.log('Данные транзакции:', transactionData);
        
        await addDoc(collection(db, 'transactions'), transactionData);
        showSnackbar(`Взнос от ${member.name} подтверждён!`, 'success');
      } catch (transactionError) {
        console.error('Ошибка при добавлении транзакции:', transactionError);
        showSnackbar('Ошибка при записи транзакции', 'error');
        
        // Откатываем статус оплаты
        updatedMembers[memberIndex] = {
          ...member,
          paid: member.paid, // Возвращаем исходный статус
          paymentDate: member.paymentDate
        };
        await updateDoc(familyRef, { members: updatedMembers });
        return;
      }
    } else {
      showSnackbar(`Взнос от ${member.name} отменён`, 'info');
    }
    
  } catch (err) {
    console.error('❌ Полная ошибка в togglePayment:', err);
    console.error('Код ошибки:', err.code);
    console.error('Сообщение:', err.message);
    
    let errorMessage = 'Ошибка при изменении статуса';
    if (err.code === 'permission-denied') {
      errorMessage = 'Ошибка доступа. Проверьте правила Firestore.';
    } else if (err.code === 'not-found') {
      errorMessage = 'Документ не найден.';
    }
    
    showSnackbar(errorMessage, 'error');
  }
};

 const handleWithdrawal = async () => {
  const amount = parseFloat(withdrawalAmount);
  if (!amount || amount <= 0 || !withdrawalReason.trim()) {
    showSnackbar('Заполните все поля корректно', 'error');
    return;
  }
  
  try {
    await addDoc(collection(db, 'transactions'), {
      type: 'withdrawal',
      amount: amount,
      reason: withdrawalReason,
      description: 'Списание из казны',
      date: new Date(), // Используем обычную дату
      timestamp: new Date().toISOString()
    });
    
    setWithdrawalAmount('');
    setWithdrawalReason('');
    showSnackbar('Средства списаны', 'success');
  } catch (err) {
    console.error('Ошибка:', err);
    showSnackbar('Ошибка при списании', 'error');
  }
};

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Шапка с балансом */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Семейная казна
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
              {balance.toLocaleString('ru-RU')} ₽
            </Typography>
            <Typography variant="body1">
              Текущий баланс
            </Typography>
          </Box>
          
          <Box>
            {currentUser && isAdmin && (
              <Chip 
                label="Администратор" 
                color="secondary" 
                sx={{ mr: 2, color: 'white', fontWeight: 'bold' }}
              />
            )}
            {currentUser ? (
              <Button
                variant="outlined"
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Выйти
              </Button>
            ) : (
              <Button
                variant="outlined"
                href="/admin"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Войти
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Если пользователь - администратор, показываем админ-панель */}
      {currentUser && isAdmin && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Управление семьями" />
            <Tab label="Отметить взносы" />
            <Tab label="Списать средства" />
            <Tab label="История" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid  xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Добавить семью
                    </Typography>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        label="Название семьи"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        onClick={addFamily}
                        startIcon={<AddIcon />}
                      >
                        Добавить
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Добавить участника
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      label="Выберите семью"
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      size="small"
                      sx={{ mb: 2 }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Выберите семью</option>
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </TextField>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        label="Имя участника"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        onClick={addMember}
                        startIcon={<AddIcon />}
                        disabled={!selectedFamily}
                      >
                        Добавить
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Список семей
                </Typography>
                {families.map((family) => (
                  <Card key={family.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{family.name}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedFamily(
                            expandedFamily === family.id ? null : family.id
                          )}
                        >
                          {expandedFamily === family.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      
                      {expandedFamily === family.id && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <List>
                            {family.members?.map((member, index) => (
                              <ListItem
                                key={index}
                                secondaryAction={
                                  <IconButton
                                    onClick={() => togglePayment(family.id, index)}
                                    color={member.paid ? "success" : "default"}
                                  >
                                    {member.paid ? <CheckIcon /> : <CancelIcon />}
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  primary={member.name}
                                  secondary={
                                    <Chip
                                      label={member.paid ? "Оплатил" : "Не оплатил"}
                                      color={member.paid ? "success" : "error"}
                                      size="small"
                                      variant="outlined"
                                    />
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Отметить ежемесячные взносы
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Нажмите на иконку рядом с участником, чтобы отметить взнос в 1000 ₽
              </Typography>
              
              <Grid container spacing={2}>
                {families.map((family) => (
                  <Grid  xs={12} md={6} key={family.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          {family.name}
                        </Typography>
                        <List>
                          {family.members?.map((member, index) => (
                            <ListItem
                              key={index}
                              secondaryAction={
                                <IconButton
                                  onClick={() => togglePayment(family.id, index)}
                                  color={member.paid ? "success" : "default"}
                                  size="large"
                                >
                                  {member.paid ? <CheckIcon /> : <CancelIcon />}
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={member.name}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    color={member.paid ? "success.main" : "error.main"}
                                  >
                                    {member.paid ? 'Внёс 1000 ₽' : 'Не внёс взнос'}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Списание средств из казны
              </Typography>
              
              <Card sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  label="Сумма списания (₽)"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
                
                <TextField
                  fullWidth
                  label="Причина списания"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  margin="normal"
                  required
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleWithdrawal}
                  sx={{ mt: 3 }}
                  disabled={!withdrawalAmount || !withdrawalReason}
                >
                  Списать средства
                </Button>
              </Card>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                История операций
              </Typography>
              
              {transactions.length === 0 ? (
                <Alert severity="info">
                  Операций пока нет
                </Alert>
              ) : (
                <List>
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} sx={{ mb: 1 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {transaction.type === 'deposit' 
                                ? `Взнос от ${transaction.memberName}`
                                : `Расход: ${transaction.reason}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString('ru-RU')}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                          >
                            {transaction.type === 'deposit' ? '+' : '-'}
                            {transaction.amount.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* Общий вид для всех пользователей */}
      {!isAdmin && (
        <>
          {/* Список семей для просмотра */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Участники
            </Typography>
            
            {families.length === 0 ? (
              <Alert severity="info">
                Семьи пока не добавлены администратором
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {families.map((family) => (
                  <Grid  xs={12} md={6} key={family.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          {family.name}
                        </Typography>
                        <List>
                          {family.members?.map((member, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={member.name}
                                secondary={
                                  <Chip
                                    label={member.paid ? "Внёс 1000 ₽" : "Не внёс"}
                                    color={member.paid ? "success" : "error"}
                                    size="small"
                                    variant="outlined"
                                  />
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          {/* История операций для просмотра */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              История операций
            </Typography>
            
            {transactions.length === 0 ? (
              <Alert severity="info">
                Операций пока нет
              </Alert>
            ) : (
              <List>
                {transactions.map((transaction) => (
                  <Card key={transaction.id} sx={{ mb: 1 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {transaction.type === 'deposit' 
                              ? `Взнос от ${transaction.memberName}`
                              : `Расход: ${transaction.reason}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.amount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}

      {/* Snackbar для уведомлений */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            minWidth: 300 
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Container>
  );
};

export default HomePage;