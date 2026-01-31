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
  Chip,
  Collapse,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  AccountBalanceWallet as BalanceIcon
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
  where,
  getDocs,
  writeBatch
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
  
  // Текущий месяц и год
  const [currentMonth, setCurrentMonth] = useState('');
  
  useEffect(() => {
    // Устанавливаем текущий месяц
    const now = new Date();
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    setCurrentMonth(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
    
    // Проверяем, нужно ли обнулить статусы (если наступил новый месяц)
    checkAndResetMonthlyPayments();
    
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
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now())
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

  // Функция для проверки и обнуления статусов в новом месяце
  const checkAndResetMonthlyPayments = async () => {
    if (!isAdmin) return;
    
    try {
      const lastResetKey = 'lastPaymentReset';
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${now.getMonth()}`;
      const lastReset = localStorage.getItem(lastResetKey);
      
      // Если еще не было сброса в этом месяце
      if (lastReset !== currentMonthYear) {
        console.log('Проверяем необходимость сброса статусов...');
        
        // Получаем все семьи
        const familiesSnapshot = await getDocs(collection(db, 'families'));
        let needsReset = false;
        
        // Проверяем, есть ли оплаченные участники
        familiesSnapshot.forEach(doc => {
          const family = doc.data();
          if (family.members && family.members.some(member => member.paid)) {
            needsReset = true;
          }
        });
        
        // Если есть оплаченные участники, сбрасываем статусы
        if (needsReset) {
          const batch = writeBatch(db);
          
          familiesSnapshot.forEach(doc => {
            const family = doc.data();
            if (family.members && family.members.length > 0) {
              const updatedMembers = family.members.map(member => ({
                ...member,
                paid: false,
                paymentDate: null
              }));
              
              batch.update(doc.ref, { members: updatedMembers });
            }
          });
          
          await batch.commit();
          console.log('✅ Статусы оплаты сброшены для нового месяца');
          
          // Добавляем системное уведомление
          await addDoc(collection(db, 'transactions'), {
            type: 'system',
            amount: 0,
            reason: 'Начало нового месяца',
            description: `Статусы взносов сброшены. ${currentMonth}`,
            date: new Date(),
            timestamp: new Date().toISOString()
          });
          
          // Сохраняем дату последнего сброса
          localStorage.setItem(lastResetKey, currentMonthYear);
          
          showSnackbar(`Начался новый месяц ${currentMonth}. Статусы взносов обновлены.`, 'info');
        }
      }
    } catch (error) {
      console.error('Ошибка при сбросе статусов:', error);
    }
  };

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
          paymentDate: null,
          paymentHistory: [] // История платежей
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
      
      // Обновляем члена семьи
      const updatedMembers = [...family.members];
      const paymentHistory = member.paymentHistory || [];
      
      if (isNowPaid) {
        // Добавляем запись в историю платежей
        paymentHistory.push({
          date: now.toISOString(),
          month: currentMonth,
          amount: 1000
        });
      }
      
      updatedMembers[memberIndex] = {
        ...member,
        paid: isNowPaid,
        paymentDate: isNowPaid ? now.toISOString() : null,
        paymentHistory: paymentHistory
      };
      
      await updateDoc(familyRef, { members: updatedMembers });
      
      // Если взнос помечен как оплаченный, добавляем транзакцию
      if (isNowPaid) {
        const transactionData = {
          type: 'deposit',
          amount: 1000,
          memberName: member.name,
          familyName: family.name,
          description: `Ежемесячный взнос за ${currentMonth}`,
          date: now,
          timestamp: now.toISOString(),
          month: currentMonth
        };
        
        await addDoc(collection(db, 'transactions'), transactionData);
        showSnackbar(`${member.name} внёс 1000 ₽ за ${currentMonth}`, 'success');
      } else {
        showSnackbar(`Взнос от ${member.name} отменён`, 'info');
      }
      
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при изменении статуса', 'error');
    }
  };

  const deleteMember = async (familyId, memberIndex) => {
    try {
      const familyRef = doc(db, 'families', familyId);
      const family = families.find(f => f.id === familyId);
      
      const updatedMembers = family.members.filter((_, index) => index !== memberIndex);
      await updateDoc(familyRef, { members: updatedMembers });
      
      showSnackbar('Участник удалён', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при удалении', 'error');
    }
  };

  const deleteFamily = async (familyId) => {
    if (!window.confirm('Удалить семью и всех её участников?')) return;
    
    try {
      await deleteDoc(doc(db, 'families', familyId));
      showSnackbar('Семья удалена', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при удалении', 'error');
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
        date: new Date(),
        timestamp: new Date().toISOString(),
        month: currentMonth
      });
      
      setWithdrawalAmount('');
      setWithdrawalReason('');
      showSnackbar('Средства списаны', 'success');
    } catch (err) {
      console.error('Ошибка:', err);
      showSnackbar('Ошибка при списании', 'error');
    }
  };

  // Функция для принудительного сброса статусов (для администратора)
  const resetAllPayments = async () => {
    if (!isAdmin || !window.confirm('Сбросить все статусы оплаты для нового месяца?')) return;
    
    try {
      const batch = writeBatch(db);
      const familiesSnapshot = await getDocs(collection(db, 'families'));
      
      familiesSnapshot.forEach(doc => {
        const family = doc.data();
        if (family.members && family.members.length > 0) {
          const updatedMembers = family.members.map(member => ({
            ...member,
            paid: false,
            paymentDate: null
          }));
          
          batch.update(doc.ref, { members: updatedMembers });
        }
      });
      
      await batch.commit();
      
      // Добавляем системное уведомление
      await addDoc(collection(db, 'transactions'), {
        type: 'system',
        amount: 0,
        reason: 'Ручной сброс статусов',
        description: `Администратор сбросил статусы взносов. ${currentMonth}`,
        date: new Date(),
        timestamp: new Date().toISOString()
      });
      
      // Обновляем локальное хранилище
      const now = new Date();
      localStorage.setItem('lastPaymentReset', `${now.getFullYear()}-${now.getMonth()}`);
      
      showSnackbar('Все статусы оплаты сброшены!', 'success');
    } catch (error) {
      console.error('Ошибка при сбросе статусов:', error);
      showSnackbar('Ошибка при сбросе статусов', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Фильтруем транзакции: показываем только расходы для обычных пользователей
  const filteredTransactions = isAdmin 
    ? transactions 
    : transactions.filter(t => t.type === 'withdrawal');

  // Статистика по взносам
  const paidCount = families.reduce((total, family) => {
    return total + (family.members?.filter(m => m.paid).length || 0);
  }, 0);
  
  const totalMembers = families.reduce((total, family) => {
    return total + (family.members?.length || 0);
  }, 0);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Шапка с балансом и текущим месяцем */}
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
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              ВАШТАРОЙ
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
              {balance.toLocaleString('ru-RU')} ₽
            </Typography>
            <Typography variant="body1">
              Текущий баланс
            </Typography>
          </Box>
          
          <Box textAlign="right">
            <Chip 
              label={currentMonth} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                mb: 1,
                fontWeight: 'bold'
              }}
            />
            <Box>
              {currentUser && isAdmin && (
                <Chip 
                  label="Администратор" 
                  color="secondary" 
                  sx={{ mr: 1, color: 'white', fontWeight: 'bold' }}
                />
              )}
              {currentUser ? (
                <Button
                  variant="outlined"
                  onClick={logout}
                  startIcon={<LogoutIcon />}
                  sx={{ color: 'white', borderColor: 'white', mt: 1 }}
                  size="small"
                >
                  Выйти
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  href="/admin"
                  sx={{ color: 'white', borderColor: 'white', mt: 1 }}
                  size="small"
                >
                  Войти как админ
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Статистика по взносам */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {paidCount}/{totalMembers}
            </Typography>
            <Typography variant="body2">
              Внесли взнос
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {totalMembers - paidCount}
            </Typography>
            <Typography variant="body2">
              Осталось внести
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {paidCount * 1000} ₽
            </Typography>
            <Typography variant="body2">
              Собрано за месяц
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Если пользователь - администратор, показываем админ-панель */}
      {currentUser && isAdmin && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Управление семьями" />
              <Tab label="Отметить взносы" />
              <Tab label="Списать средства" />
              <Tab label="Полная история" />
            </Tabs>
            
            <Button 
              variant="outlined" 
              color="warning"
              onClick={resetAllPayments}
              size="small"
            >
              Сбросить все взносы
            </Button>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
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

              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Список семей ({currentMonth})
                </Typography>
                {families.map((family) => (
                  <Card key={family.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <GroupsIcon color="primary" />
                          <Typography variant="h6">{family.name}</Typography>
                          <Badge 
                            badgeContent={family.members?.filter(m => m.paid).length || 0} 
                            color="success"
                            sx={{ ml: 1 }}
                          >
                            <Chip 
                              label={`${family.members?.length || 0} участников`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Badge>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => deleteFamily(family.id)}
                            color="error"
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedFamily(
                              expandedFamily === family.id ? null : family.id
                            )}
                          >
                            {expandedFamily === family.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Collapse in={expandedFamily === family.id}>
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <List>
                            {family.members?.map((member, index) => (
                              <ListItem
                                key={index}
                                secondaryAction={
                                  <Box>
                                    <IconButton
                                      onClick={() => togglePayment(family.id, index)}
                                      color={member.paid ? "success" : "default"}
                                      size="small"
                                    >
                                      {member.paid ? <CheckIcon /> : <CancelIcon />}
                                    </IconButton>
                                    <IconButton
                                      onClick={() => deleteMember(family.id, index)}
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                }
                              >
                                <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                                  <PersonIcon color={member.paid ? "success" : "action"} />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1">{member.name}</Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Chip
                                        label={member.paid ? "✅ Внёс 1000 ₽" : "❌ Не внёс"}
                                        color={member.paid ? "success" : "error"}
                                        size="small"
                                        variant="outlined"
                                      />
                                      {member.paymentDate && (
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(member.paymentDate).toLocaleDateString('ru-RU')}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Отметить ежемесячные взносы за {currentMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Нажмите на иконку рядом с участником, чтобы отметить/отменить взнос 1000 ₽
              </Typography>
              
              <Grid container spacing={2}>
                {families.map((family) => (
                  <Grid xs={12} md={6} key={family.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography variant="h6" color="primary">
                            {family.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {family.members?.filter(m => m.paid).length || 0}/{family.members?.length || 0}
                          </Typography>
                        </Box>
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
                              <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                                <PersonIcon color={member.paid ? "success" : "action"} />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1">{member.name}</Typography>
                                  <Typography
                                    variant="body2"
                                    color={member.paid ? "success.main" : "error.main"}
                                  >
                                    {member.paid ? '✅ Внёс 1000 ₽' : '❌ Не внёс взнос'}
                                  </Typography>
                                </Box>
                              </Box>
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
                Полная история операций
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
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {transaction.type === 'deposit' 
                                ? `✅ Взнос от ${transaction.memberName}`
                                : transaction.type === 'withdrawal'
                                ? `➖ Расход: ${transaction.reason}`
                                : `📋 ${transaction.reason}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {transaction.month && ` • ${transaction.month}`}
                            </Typography>
                            {transaction.description && (
                              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                {transaction.description}
                              </Typography>
                            )}
                          </Box>
                          {transaction.type !== 'system' && (
                            <Typography
                              variant="h6"
                              color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                            >
                              {transaction.type === 'deposit' ? '+' : '-'}
                              {transaction.amount.toLocaleString('ru-RU')} ₽
                            </Typography>
                          )}
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

      {/* ОБЩИЙ ВИД ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ - ВИДНО КТО ВНЁС/НЕ ВНЁС */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupsIcon color="primary" />
            <Typography variant="h5">
              Участники казны • {currentMonth}
            </Typography>
          </Box>
          <Chip 
            label={`${paidCount}/${totalMembers} внесли`} 
            color={paidCount === totalMembers ? "success" : "warning"}
            size="medium"
          />
        </Box>
        
        {families.length === 0 ? (
          <Alert severity="info">
            Семьи пока не добавлены. Администратор добавит семьи и участников.
          </Alert>
        ) : (
          <Box>
            {families.map((family) => {
              const familyPaidCount = family.members?.filter(m => m.paid).length || 0;
              const familyTotal = family.members?.length || 0;
              
              return (
                <Card key={family.id} sx={{ mb: 2 }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <ListItem 
                      button 
                      onClick={() => setExpandedFamily(
                        expandedFamily === family.id ? null : family.id
                      )}
                      sx={{ 
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center" gap={2}>
                          <GroupsIcon color="action" />
                          <Box>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                              {family.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={`${familyPaidCount}/${familyTotal} внесли`}
                                color={familyPaidCount === familyTotal ? "success" : familyPaidCount > 0 ? "warning" : "error"}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>
                        {expandedFamily === family.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Box>
                    </ListItem>
                    
                    <Collapse in={expandedFamily === family.id}>
                      <Box sx={{ mt: 2, pl: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <List disablePadding>
                          {family.members?.map((member, index) => (
                            <ListItem 
                              key={index} 
                              sx={{ 
                                pl: 3,
                                py: 1.5,
                                borderLeft: '2px solid',
                                borderColor: member.paid ? 'success.light' : 'error.light',
                                mb: 0.5,
                                bgcolor: member.paid ? 'success.50' : 'error.50'
                              }}
                            >
                              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Box display="flex" alignItems="center" gap={2}>
                                  {member.paid ? (
                                    <CheckIcon color="success" fontSize="small" />
                                  ) : (
                                    <CancelIcon color="error" fontSize="small" />
                                  )}
                                  <Typography variant="body1">
                                    {member.name}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={member.paid ? "✅ Внёс 1000 ₽" : "❌ Не внёс"}
                                  color={member.paid ? "success" : "error"}
                                  size="small"
                                  variant="filled"
                                />
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
        
       
      </Paper>

      {/* История операций - только расходы для обычных пользователей */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          История расходов
        </Typography>
        
        {filteredTransactions.length === 0 ? (
          <Alert severity="info">
            {isAdmin ? 'Расходов пока нет' : 'Расходов из казны пока не было'}
          </Alert>
        ) : (
          <List>
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {transaction.reason || 'Расход из казны'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {transaction.month && ` • ${transaction.month}`}
                      </Typography>
                      {transaction.description && (
                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                          {transaction.description}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="h6"
                      color="error.main"
                    >
                      -{transaction.amount.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Paper>

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