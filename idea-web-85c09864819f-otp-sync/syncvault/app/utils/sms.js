import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../App';

export const getSMSS = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'users', user.uid, 'smsMessages'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages = [];

    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    return [];
  }
};
