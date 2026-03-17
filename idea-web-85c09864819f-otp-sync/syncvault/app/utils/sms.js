import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../App';

export const getSMSS = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    const q = query(
      collection(db, 'users', user.uid, 'smsMessages'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));

    return messages;
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    return [];
  }
};
