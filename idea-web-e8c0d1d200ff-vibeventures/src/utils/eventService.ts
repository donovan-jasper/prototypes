import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { encodeGeohash, getGeohashRange, calculateDistance } from './geohash';

export const getEvents = async (coords: { latitude: number; longitude: number }, radiusInKm: number = 10) => {
  const eventsRef = collection(db, 'events');
  
  // Get geohash ranges for the search area
  const geohashRanges = getGeohashRange(coords.latitude, coords.longitude, radiusInKm);
  
  const allEvents: any[] = [];
  const seenIds = new Set<string>();

  // Query events for each geohash prefix
  for (const geohashPrefix of geohashRanges) {
    const q = query(
      eventsRef,
      where('geohash', '>=', geohashPrefix),
      where('geohash', '<=', geohashPrefix + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        const eventData = doc.data();
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          eventData.latitude,
          eventData.longitude
        );
        
        // Filter by actual distance
        if (distance <= radiusInKm) {
          allEvents.push({ 
            id: doc.id, 
            ...eventData,
            distance 
          });
          seenIds.add(doc.id);
        }
      }
    });
  }

  // Sort by distance
  allEvents.sort((a, b) => a.distance - b.distance);
  
  return allEvents;
};

export const joinEvent = async (eventId: string, userId: string) => {
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

export const createEvent = async (eventData: {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
}) => {
  if (!eventData || !eventData.title || !eventData.latitude || !eventData.longitude) {
    throw new Error('Event data is incomplete');
  }

  // Generate geohash for the event location
  const geohash = encodeGeohash(eventData.latitude, eventData.longitude, 9);

  const eventsRef = collection(db, 'events');
  const newEvent = {
    ...eventData,
    geohash,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    participants: []
  };

  const docRef = await addDoc(eventsRef, newEvent);
  return { id: docRef.id, ...newEvent };
};
