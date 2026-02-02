import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Header from '../components/layout/Header';
import FamilyList from '../components/families/FamilyList';
import TransactionList from '../components/transactions/TransactionList';

const HomePage = () => {
  const { currentUser, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [families, setFamilies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedFamily, setExpandedFamily] = useState(null);

  useEffect(() => {
    // Загрузка транзакций
    const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      let totalBalance = 0;
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.type === 'deposit') {
          totalBalance += data.amount || 0;
        } else if (data.type === 'withdrawal') {
          totalBalance -= data.amount || 0;
        }
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

  const togglePayment = async (familyId, memberIndex, member) => {
    if (!isAdmin) return;
    
    try {
      const familyRef = doc(db, 'families', familyId);
      const family = families.find(f => f.id === familyId);
      
      if (!family || !family.members || !family.members[memberIndex]) {
        console.error('Участник не найден');
        return;
      }
      
      const isNowPaid = !member.paid;
      const now = new Date();
      
      // Обновляем статус участника
      const updatedMembers = [...family.members];
      updatedMembers[memberIndex] = {
        ...member,
        paid: isNowPaid,
        paymentDate: isNowPaid ? now.toISOString() : null
      };
      
      // Сначала обновляем участника
      await updateDoc(familyRef, { members: updatedMembers });
      
      // Затем добавляем или удаляем транзакцию
      if (isNowPaid) {
        // Добавляем транзакцию взноса
        await addDoc(collection(db, 'transactions'), {
          type: 'deposit',
          amount: 1000,
          memberName: member.name,
          familyName: family.name,
          description: `Ежемесячный взнос`,
          date: now,
          timestamp: now.toISOString()
        });
      } else {
        // Находим и удаляем транзакцию взноса
        const transactionsRef = collection(db, 'transactions');
        const transactionsSnapshot = await getDocs(transactionsRef);
        const batch = writeBatch(db);
        let found = false;
        
        transactionsSnapshot.docs.forEach(transactionDoc => {
          const transaction = transactionDoc.data();
          if (transaction.type === 'deposit' && 
              transaction.memberName === member.name &&
              transaction.amount === 1000 &&
              transaction.familyName === family.name) {
            
            const transactionDate = transaction.date?.toDate ? 
              transaction.date.toDate() : new Date(transaction.date || transaction.timestamp);
            const now = new Date();
            const isThisMonth = transactionDate.getMonth() === now.getMonth() &&
                               transactionDate.getFullYear() === now.getFullYear();
            
            if (isThisMonth) {
              batch.delete(transactionDoc.ref);
              found = true;
            }
          }
        });
        
        if (found) {
          await batch.commit();
        }
      }
      
      // Обновляем локальное состояние
      setFamilies(prev => prev.map(f => 
        f.id === familyId ? { ...f, members: updatedMembers } : f
      ));
      
    } catch (error) {
      console.error('Ошибка при изменении статуса оплаты:', error);
      alert('Ошибка при изменении статуса: ' + error.message);
    }
  };

  // Статистика
  const paidCount = families.reduce((total, family) => {
    return total + (family.members?.filter(m => m.paid).length || 0);
  }, 0);
  
  const totalMembers = families.reduce((total, family) => {
    return total + (family.members?.length || 0);
  }, 0);

  const collectedAmount = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="sm" sx={{ p: 1, pb: 4 }}>
      <Header
        balance={balance}
        paidCount={paidCount}
        totalMembers={totalMembers}
        collectedAmount={collectedAmount}
      />

      <FamilyList
        families={families}
        expandedFamily={expandedFamily}
        setExpandedFamily={setExpandedFamily}
        isAdmin={isAdmin && currentUser}
        onTogglePayment={togglePayment}
      />

      <TransactionList
        transactions={transactions}
        isAdmin={isAdmin && currentUser}
      />
    </Container>
  );
};

export default HomePage;