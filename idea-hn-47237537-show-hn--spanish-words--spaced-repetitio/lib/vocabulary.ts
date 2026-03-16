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
  for (const word of spanishWords) {
    await addWord(word);
  }
};
