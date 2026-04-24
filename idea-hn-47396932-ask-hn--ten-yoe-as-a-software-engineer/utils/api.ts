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

export const submitQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  // This function is now handled directly in the component using Firebase
  // The actual implementation is in the component file
  throw new Error('submitQuestion should be handled in the component using Firebase');
};
