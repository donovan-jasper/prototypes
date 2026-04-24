import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export const createTradeRecord = async (tradeData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const tradesRef = ref(database, `users/${user.uid}/trades`);
    const newTradeRef = push(tradesRef);
    await set(newTradeRef, {
      ...tradeData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    // Simulate trade processing with a timeout
    setTimeout(async () => {
      await set(ref(database, `users/${user.uid}/trades/${newTradeRef.key}`), {
        ...tradeData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }, 3000);

    return newTradeRef.key;
  } catch (error) {
    console.error('Error creating trade record:', error);
    throw error;
  }
};

export const getTradeStatus = (tradeId, callback) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const tradeRef = ref(database, `users/${user.uid}/trades/${tradeId}`);
  return onValue(tradeRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export { database, auth };
