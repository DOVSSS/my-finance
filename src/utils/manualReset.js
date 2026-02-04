import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';

// Получить текущий месяц для отображения
export const getCurrentMonthDisplay = () => {
  const now = new Date();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

// Ручной сброс всех статусов
export const resetAllPayments = async () => {
  try {
    console.log('🔄 Начинаю ручной сброс статусов...');
    const batch = writeBatch(db);
    const familiesSnapshot = await getDocs(collection(db, 'families'));
    
    let resetCount = 0;
    
    familiesSnapshot.forEach(familyDoc => {
      const family = familyDoc.data();
      if (family.members && family.members.length > 0) {
        // Считаем сколько участников сбрасываем
        const paidMembers = family.members.filter(m => m.paid).length;
        resetCount += paidMembers;
        
        // Сбрасываем статусы всех участников
        const updatedMembers = family.members.map(member => ({
          ...member,
          paid: false,
          paymentDate: null
        }));
        
        batch.update(familyDoc.ref, { members: updatedMembers });
      }
    });
    
    await batch.commit();
    
    // Добавляем системное уведомление о ручном сбросе
    if (resetCount > 0) {
      await addDoc(collection(db, 'transactions'), {
        type: 'system',
        amount: 0,
        reason: 'Ручной сброс статусов',
        description: `Администратор сбросил статусы ${resetCount} участников. ${getCurrentMonthDisplay()}`,
        date: new Date(),
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Сброшены статусы ${resetCount} участников`);
    return { 
      success: true, 
      message: `Сброшены статусы ${resetCount} участников`,
      resetCount 
    };
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе статусов:', error);
    return { 
      success: false, 
      message: 'Ошибка при сбросе статусов: ' + error.message 
    };
  }
};

// Сброс для конкретной семьи
export const resetFamilyPayments = async (familyId) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      return { success: false, message: 'Семья не найдена' };
    }
    
    const family = familyDoc.data();
    if (!family.members || family.members.length === 0) {
      return { success: false, message: 'В семье нет участников' };
    }
    
    // Сбрасываем статусы всех участников семьи
    const updatedMembers = family.members.map(member => ({
      ...member,
      paid: false,
      paymentDate: null
    }));
    
    await updateDoc(familyRef, { members: updatedMembers });
    
    // Добавляем уведомление
    const paidCount = family.members.filter(m => m.paid).length;
    if (paidCount > 0) {
      await addDoc(collection(db, 'transactions'), {
        type: 'system',
        amount: 0,
        reason: 'Сброс статусов семьи',
        description: `Сброшены статусы ${paidCount} участников семьи "${family.name}"`,
        date: new Date(),
        timestamp: new Date().toISOString()
      });
    }
    
    return { 
      success: true, 
      message: `Сброшены статусы ${paidCount} участников семьи "${family.name}"`,
      resetCount: paidCount 
    };
    
  } catch (error) {
    console.error('❌ Ошибка при сбросе статусов семьи:', error);
    return { success: false, message: 'Ошибка: ' + error.message };
  }
};