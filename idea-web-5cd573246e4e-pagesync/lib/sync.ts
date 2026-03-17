import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants/Config';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser: User | null = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export const initAuth = async (): Promise<User | null> => {
  try {
    if (currentUser) {
      return currentUser;
    }
    
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;
    return currentUser;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    throw error;
  }
};

export const syncToCloud = async (bookData: any, options: { offline?: boolean } = {}): Promise<{ success: boolean; queued?: boolean }> => {
  if (options.offline) {
    return { success: false, queued: true };
  }

  try {
    const user = currentUser || await initAuth();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const bookRef = doc(db, `users/${user.uid}/books`, bookData.id);
    await setDoc(bookRef, { 
      ...bookData, 
      syncedAt: Date.now(),
      userId: user.uid 
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Sync to cloud failed:', error);
    return { success: false, queued: true };
  }
};

export const syncFromCloud = async (): Promise<any[]> => {
  try {
    const user = currentUser || await initAuth();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const booksRef = collection(db, `users/${user.uid}/books`);
    const q = query(booksRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Sync from cloud failed:', error);
    return [];
  }
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};
