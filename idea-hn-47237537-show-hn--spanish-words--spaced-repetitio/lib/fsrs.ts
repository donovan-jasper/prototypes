interface CardState {
  difficulty: number;
  stability: number;
  retrievability: number;
}

interface ReviewResult {
  date: Date;
  intervalDays: number;
}

export function calculateNextReview(card: CardState, rating: 'forgot' | 'hard' | 'good' | 'easy'): ReviewResult {
  const now = new Date();
  let intervalDays = 1;

  // Adjust interval based on rating and current stability
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

  // Add some randomness to prevent overfitting
  intervalDays = Math.floor(intervalDays * (0.9 + Math.random() * 0.2));

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + intervalDays);

  return {
    date: nextReviewDate,
    intervalDays,
  };
}

export function updateCardState(card: CardState, rating: 'forgot' | 'hard' | 'good' | 'easy'): CardState {
  const newCard = { ...card };

  // Update difficulty based on rating
  switch (rating) {
    case 'forgot':
      newCard.difficulty = Math.max(1, newCard.difficulty - 0.2);
      newCard.stability = Math.max(1, newCard.stability * 0.5);
      break;
    case 'hard':
      newCard.difficulty = Math.max(1, newCard.difficulty - 0.15);
      newCard.stability = Math.max(1, newCard.stability * 0.8);
      break;
    case 'good':
      newCard.difficulty = Math.min(10, newCard.difficulty + 0.1);
      newCard.stability = Math.max(1, newCard.stability * 1.1);
      break;
    case 'easy':
      newCard.difficulty = Math.min(10, newCard.difficulty + 0.2);
      newCard.stability = Math.max(1, newCard.stability * 1.2);
      break;
  }

  // Update retrievability based on rating
  switch (rating) {
    case 'forgot':
      newCard.retrievability = 0;
      break;
    case 'hard':
      newCard.retrievability = 0.5;
      break;
    case 'good':
      newCard.retrievability = 0.8;
      break;
    case 'easy':
      newCard.retrievability = 1;
      break;
  }

  return newCard;
}
