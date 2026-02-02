import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const checkAdminStatus = async (userId) => {
  if (!userId) return false;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    return adminDoc.exists();
  } catch (error) {
    console.error('Ошибка проверки прав:', error);
    return false;
  }
};