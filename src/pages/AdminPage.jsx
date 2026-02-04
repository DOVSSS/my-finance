import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  writeBatch,
   getDocs, // ДОБАВЬТЕ ЭТО
 
} from 'firebase/firestore';
import AdminPanel from '../components/layout/AdminPanel';

const AdminPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Состояния для админ-панели
  const [families, setFamilies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');

  useEffect(() => {
    if (currentUser && isAdmin) {
      // Загрузка данных для админ-панели
      const familiesQuery = query(collection(db, 'families'), orderBy('createdAt'));
      const unsubscribeFamilies = onSnapshot(familiesQuery, (snapshot) => {
        const familiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFamilies(familiesData);
      });

      const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date || Date.now())
        }));
        setTransactions(transactionsData);
      });

      return () => {
        unsubscribeFamilies();
        unsubscribeTransactions();
      };
    }
  }, [currentUser, isAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Неверный email или пароль. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  // Добавьте эти функции в AdminPage.jsx

const deleteFamily = async (familyId) => {
  try {
    // Удаляем семью из Firestore
    await deleteDoc(doc(db, 'families', familyId));
    
    // Добавляем системное уведомление
    await addDoc(collection(db, 'transactions'), {
      type: 'system',
      amount: 0,
      reason: 'Удаление семьи',
      description: 'Семья и все участники удалены',
      date: new Date(),
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Семья удалена');
    
  } catch (error) {
    console.error('❌ Ошибка при удалении семьи:', error);
    alert('Ошибка при удалении семьи: ' + error.message);
  }
};

const deleteMember = async (familyId, memberIndex) => {
  try {
    const family = families.find(f => f.id === familyId);
    
    if (!family || !family.members || !family.members[memberIndex]) {
      console.error('Участник не найден');
      return;
    }
    
    const memberName = family.members[memberIndex].name;
    
    // Подтверждение
    if (!window.confirm(`Удалить участника "${memberName}"?`)) {
      return;
    }
    
    const familyRef = doc(db, 'families', familyId);
    
    // Создаем новый массив без удаляемого участника
    const updatedMembers = family.members.filter((_, index) => index !== memberIndex);
    
    // Обновляем документ семьи
    await updateDoc(familyRef, { members: updatedMembers });
    
    // Добавляем системное уведомление
    await addDoc(collection(db, 'transactions'), {
      type: 'system',
      amount: 0,
      reason: 'Удаление участника',
      description: `Участник "${memberName}" удалён из семьи "${family.name}"`,
      date: new Date(),
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Участник "${memberName}" удалён`);
    alert(`Участник "${memberName}" успешно удалён`);
    
  } catch (error) {
    console.error('❌ Ошибка при удалении участника:', error);
    alert('Ошибка при удалении участника: ' + error.message);
  }
};

  // Функции для админ-панели
  const addFamily = async () => {
    if (!newFamilyName.trim()) return;
    
    try {
      await addDoc(collection(db, 'families'), {
        name: newFamilyName,
        members: [],
        createdAt: new Date().toISOString()
      });
      setNewFamilyName('');
    } catch (err) {
      console.error('Ошибка:', err);
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
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const togglePayment = async (familyId, memberIndex, member) => {
    try {
      const familyRef = doc(db, 'families', familyId);
      const family = families.find(f => f.id === familyId);
      
      if (!family || !family.members || !family.members[memberIndex]) {
        console.error('Участник не найден');
        return;
      }
      
      const isNowPaid = !member.paid;
      const now = new Date();
      
      // Обновляем члена семьи
      const updatedMembers = [...family.members];
      updatedMembers[memberIndex] = {
        ...member,
        paid: isNowPaid,
        paymentDate: isNowPaid ? now.toISOString() : null
      };
      
      await updateDoc(familyRef, { members: updatedMembers });
      
      // Добавляем транзакцию
      await addDoc(collection(db, 'transactions'), {
        type: isNowPaid ? 'deposit' : 'withdrawal',
        amount: 1000,
        memberName: member.name,
        familyName: family.name,
        description: isNowPaid ? 'Взнос' : 'Отмена взноса',
        date: now,
        timestamp: now.toISOString()
      });
      
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0 || !withdrawalReason.trim()) return;
    
    try {
      await addDoc(collection(db, 'transactions'), {
        type: 'withdrawal',
        amount: amount,
        reason: withdrawalReason,
        description: 'Списание из казны',
        date: new Date(),
        timestamp: new Date().toISOString()
      });
      
      setWithdrawalAmount('');
      setWithdrawalReason('');
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  // Если пользователь уже вошел и он админ, показываем админ-панель
  if (currentUser && isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ p: 1, pb: 4 }}>
        <AdminPanel
          families={families}
          transactions={transactions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
           onDeleteFamily={deleteFamily}
           onDeleteMember={deleteMember}
          newFamilyName={newFamilyName}
          setNewFamilyName={setNewFamilyName}
          newMemberName={newMemberName}
          setNewMemberName={setNewMemberName}
          selectedFamily={selectedFamily}
          setSelectedFamily={setSelectedFamily}
          withdrawalAmount={withdrawalAmount}
          setWithdrawalAmount={setWithdrawalAmount}
          withdrawalReason={withdrawalReason}
          setWithdrawalReason={setWithdrawalReason}
          onAddFamily={addFamily}
          onAddMember={addMember}
          onTogglePayment={togglePayment}
          onWithdraw={handleWithdrawal}
          
        />
        
      </Container>
    );
  }

  // Форма входа
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/')}
            size="small"
          >
            На главную
          </Button>
          <Typography variant="h5" component="h1">
            Вход для администратора
          </Typography>
        </Box>
        
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email администратора"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminPage;