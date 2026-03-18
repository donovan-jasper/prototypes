import spanishWords from '../assets/vocabulary/spanish-1000.json';
import { addWord } from './database';

export interface Word {
  id?: number;
  word: string;
  translation: string;
  frequency: number;
  category: string;
  example: string;
  audioUrl: string;
  imageUrl?: string;
}

export const getTopWords = (count: number): Word[] => {
  return spanishWords.slice(0, count);
};

export const getWordsByCategory = (category: string): Word[] => {
  return spanishWords.filter(word => word.category === category);
};

export const seedDatabase = async () => {
  const currentTime = Date.now();
  
  for (const word of spanishWords) {
    const wordId = await addWord(word);
    
    // Create initial user_progress record for each word
    await new Promise((resolve, reject) => {
      const db = require('expo-sqlite').openDatabase('vocavault.db');
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `INSERT INTO user_progress (wordId, lastReviewed, nextReview, difficulty, stability, retrievability, correctCount, incorrectCount)
             VALUES (?, NULL, ?, 2.5, 1, 0, 0, 0)`,
            [wordId, currentTime],
            (_: any, result: any) => resolve(result.insertId),
            (_: any, error: any) => reject(error)
          );
        }
      );
    });
  }
};
