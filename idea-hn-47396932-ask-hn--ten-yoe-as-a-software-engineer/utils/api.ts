import { Question } from '../types';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getQuestions = async (): Promise<Question[]> => {
  try {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as Question);
    });
    return questions;
  } catch (error) {
    console.error('Error fetching questions from Firebase:', error);
    throw error;
  }
};
