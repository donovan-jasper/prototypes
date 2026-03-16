import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export const getEvents = async (coords) => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('latitude', '>', coords.latitude - 0.1), where('latitude', '<', coords.latitude + 0.1), where('longitude', '>', coords.longitude - 0.1), where('longitude', '<', coords.longitude + 0.1));
  const querySnapshot = await getDocs(q);
  const events = [];
  querySnapshot.forEach((doc) => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
};

export const joinEvent = async (eventId) => {
  // Implement join event logic
};

export const createEvent = async (eventData) => {
  const eventsRef = collection(db, 'events');
  await addDoc(eventsRef, eventData);
};
