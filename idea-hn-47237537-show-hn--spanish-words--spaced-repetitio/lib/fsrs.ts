import { WordProgress } from './database';

interface CardState {
  difficulty: number;
  stability: number;
  retrievability: number;
}

interface NextReview {
  date: Date;
  intervalDays: number;
}

export const calculateNextReview = (card: CardState, rating: 'forgot' | 'hard' | 'good' | 'easy'): NextReview => {
  // FSRS-4.5 algorithm implementation
  // This is a simplified version for demonstration
  // In production, you would use the full algorithm with more parameters

  let intervalDays = 1; // Default to 1 day

  // Adjust interval based on rating
  switch (rating) {
    case 'forgot':
      intervalDays = 1;
      break;
    case 'hard':
      intervalDays = Math.max(1, Math.floor(card.stability * 0.5));
      break;
    case 'good':
      intervalDays = Math.max(1, Math.floor(card.stability * 0.8));
      break;
    case 'easy':
      intervalDays = Math.max(1, Math.floor(card.stability * 1.2));
      break;
  }

  // Add some randomness to prevent perfect spacing
  intervalDays = Math.floor(intervalDays * (0.9 + Math.random() * 0.2));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    date: nextReviewDate,
    intervalDays,
  };
};

export const updateCardState = (card: CardState, rating: 'forgot' | 'hard' | 'good' | 'easy'): CardState => {
  // Update card state based on rating
  let newDifficulty = card.difficulty;
  let newStability = card.stability;
  let newRetrievability = card.retrievability;

  switch (rating) {
    case 'forgot':
      newDifficulty = Math.max(0, card.difficulty - 0.2);
      newStability = Math.max(1, card.stability * 0.5);
      newRetrievability = 0;
      break;
    case 'hard':
      newDifficulty = Math.min(10, card.difficulty + 0.1);
      newStability = Math.max(1, card.stability * 0.7);
      newRetrievability = 0.5;
      break;
    case 'good':
      newDifficulty = Math.min(10, card.difficulty + 0.05);
      newStability = Math.max(1, card.stability * 0.9);
      newRetrievability = 0.8;
      break;
    case 'easy':
      newDifficulty = Math.min(10, card.difficulty - 0.05);
      newStability = Math.max(1, card.stability * 1.1);
      newRetrievability = 1;
      break;
  }

  return {
    difficulty: newDifficulty,
    stability: newStability,
    retrievability: newRetrievability,
  };
};

export const getDueWords = async (limit: number, isNew: boolean): Promise<WordProgress[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const now = Date.now();

        if (isNew) {
          // Get words that have never been reviewed
          tx.executeSql(
            `SELECT w.*, up.*
             FROM words w
             LEFT JOIN user_progress up ON w.id = up.wordId
             WHERE up.wordId IS NULL
             ORDER BY w.frequency DESC
             LIMIT ?`,
            [limit],
            (_, { rows }) => {
              const words = rows._array.map(word => ({
                ...word,
                difficulty: word.difficulty || 2.5,
                stability: word.stability || 1,
                retrievability: word.retrievability || 0,
                correctCount: word.correctCount || 0,
                incorrectCount: word.incorrectCount || 0,
              }));
              resolve(words);
            },
            (_, error) => reject(error)
          );
        } else {
          // Get words that are due for review
          tx.executeSql(
            `SELECT w.*, up.*
             FROM words w
             JOIN user_progress up ON w.id = up.wordId
             WHERE up.nextReview <= ? AND up.nextReview IS NOT NULL
             ORDER BY up.nextReview ASC, w.frequency DESC
             LIMIT ?`,
            [now, limit],
            (_, { rows }) => {
              const words = rows._array.map(word => ({
                ...word,
                difficulty: word.difficulty || 2.5,
                stability: word.stability || 1,
                retrievability: word.retrievability || 0,
                correctCount: word.correctCount || 0,
                incorrectCount: word.incorrectCount || 0,
              }));
              resolve(words);
            },
            (_, error) => reject(error)
          );
        }
      }
    );
  });
};
