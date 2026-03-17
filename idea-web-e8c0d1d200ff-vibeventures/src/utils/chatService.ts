import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const getMessages = (eventId, callback) => {
  const messagesRef = collection(db, 'events', eventId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

export const sendMessage = async (eventId, text) => {
  const messagesRef = collection(db, 'events', eventId, 'messages');
  await addDoc(messagesRef, {
    text,
    timestamp: serverTimestamp(),
  });
};

export const validateMessage = (text: string): boolean => {
  return text.trim().length > 0;
};
