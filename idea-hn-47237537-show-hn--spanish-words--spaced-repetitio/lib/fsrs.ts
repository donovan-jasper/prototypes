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
  // Simplified FSRS algorithm implementation
  // In a real app, you would use the full FSRS-4.5 algorithm

  let intervalDays = 1; // Default to 1 day

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

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    date: nextReviewDate,
    intervalDays,
  };
};

export const updateCardState = (card: CardState, rating: 'forgot' | 'hard' | 'good' | 'easy'): CardState => {
  // Simplified state update logic
  // In a real app, you would use the full FSRS-4.5 algorithm

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
