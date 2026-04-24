import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const submitToFirebase = async (paperData) => {
  try {
    const docRef = await addDoc(collection(db, "papers"), paperData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Firebase submission error:', error);
    throw error;
  }
};
