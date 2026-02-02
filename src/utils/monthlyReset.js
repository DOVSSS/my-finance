import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';

// Получить текущий месяц в формате "2024-01"
export const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Январь = 01
  return `${year}-${month}`;
};

// Получить текущий месяц для отображения "Январь 2024"
export const getCurrentMonthDisplay = () => {
  const now = new Date();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

// Проверить и выполнить сброс статусов если наступил новый месяц
export const checkAndResetMonthlyStatus = async () => {
  try {
    const currentMonthKey = getCurrentMonthKey();
    const lastResetKey = 'lastMonthlyReset';
    const lastReset = localStorage.getItem(lastResetKey);
    
    // Если уже сбрасывали в этом месяце, пропускаем
    if (lastReset === currentMonthKey) {
      console.log('✅ Сброс уже выполнен в этом месяце');
      return false;
    }
    
    console.log('🔍 Проверяю необходимость сброса статусов...');
    
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
      console.log('🔄 Сбрасываю статусы оплаты для нового месяца...');
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
      
      // Добавляем системную запись о сбросе
      await addDoc(collection(db, 'transactions'), {
        type: 'system',
        amount: 0,
        reason: 'Начало нового месяца',
        description: `Автоматический сброс статусов. ${getCurrentMonthDisplay()}`,
        date: new Date(),
        timestamp: new Date().toISOString()
      });
      
      // Сохраняем дату последнего сброса
      localStorage.setItem(lastResetKey, currentMonthKey);
      
      console.log('✅ Статусы сброшены для нового месяца');
      return true;
    }
    
    console.log('ℹ️ Нет оплаченных участников, сброс не требуется');
    return false;
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе статусов:', error);
    return false;
  }
};

// Принудительный сброс статусов (для администратора)
export const forceResetAllPayments = async () => {
  try {
    console.log('🔄 Принудительный сброс всех статусов...');
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
      description: `Администратор сбросил все статусы взносов. ${getCurrentMonthDisplay()}`,
      date: new Date(),
      timestamp: new Date().toISOString()
    });
    
    // Обновляем localStorage
    localStorage.setItem('lastMonthlyReset', getCurrentMonthKey());
    
    console.log('✅ Все статусы сброшены принудительно');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка при принудительном сбросе:', error);
    return false;
  }
};