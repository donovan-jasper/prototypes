import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const getEvents = async (coords) => {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('latitude', '>', coords.latitude - 0.1),
    where('latitude', '<', coords.latitude + 0.1),
    where('longitude', '>', coords.longitude - 0.1),
    where('longitude', '<', coords.longitude + 0.1)
  );
  const querySnapshot = await getDocs(q);
  const events = [];
  querySnapshot.forEach((doc) => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
};

export const joinEvent = async (eventId, userId) => {
  if (!userId) {
    throw new Error('User ID is required to join an event');
  }

  // Add user to event participants
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    participants: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });

  // Create chat room if it doesn't exist
  const chatRef = collection(db, 'events', eventId, 'messages');
  const chatSnapshot = await getDocs(chatRef);

  if (chatSnapshot.empty) {
    // Initialize chat with welcome message
    await addDoc(chatRef, {
      text: 'Welcome to the event chat!',
      timestamp: serverTimestamp(),
      system: true
    });
  }

  return { success: true };
};

export const createEvent = async (eventData) => {
  if (!eventData || !eventData.title || !eventData.latitude || !eventData.longitude) {
    throw new Error('Event data is incomplete');
  }

  const eventsRef = collection(db, 'events');
  const newEvent = {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    participants: []
  };

  const docRef = await addDoc(eventsRef, newEvent);
  return { id: docRef.id, ...newEvent };
};
