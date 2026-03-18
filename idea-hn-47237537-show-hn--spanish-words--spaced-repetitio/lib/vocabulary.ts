import spanishWords from '../assets/vocabulary/spanish-1000.json';
import { addWord } from './database';
import * as SQLite from 'expo-sqlite';

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
  const db = SQLite.openDatabase('vocavault.db');
  const currentTime = Date.now();
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Batch insert all words
        const wordValues = spanishWords.map(word => 
          `('${word.word.replace(/'/g, "''")}', '${word.translation.replace(/'/g, "''")}', ${word.frequency}, '${word.category}', '${word.example.replace(/'/g, "''")}', '${word.audioUrl}', ${word.imageUrl ? `'${word.imageUrl}'` : 'NULL'})`
        ).join(',');
        
        tx.executeSql(
          `INSERT INTO words (word, translation, frequency, category, example, audioUrl, imageUrl) VALUES ${wordValues}`,
          [],
          (_, result) => {
            // Get the first inserted ID
            const firstId = result.insertId - spanishWords.length + 1;
            
            // Batch insert user_progress records
            const progressValues = spanishWords.map((_, index) => 
              `(${firstId + index}, NULL, ${currentTime}, 2.5, 1, 0, 0, 0)`
            ).join(',');
            
            tx.executeSql(
              `INSERT INTO user_progress (wordId, lastReviewed, nextReview, difficulty, stability, retrievability, correctCount, incorrectCount) VALUES ${progressValues}`,
              [],
              (_, progressResult) => {
                console.log('Database seeded successfully');
              },
              (_, error) => {
                console.error('Error seeding user_progress:', error);
                return false;
              }
            );
          },
          (_, error) => {
            console.error('Error seeding words:', error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('Seed transaction completed');
        resolve(true);
      }
    );
  });
};
