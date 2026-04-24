import { SQLiteDatabase } from 'expo-sqlite';

interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  recallStrength: number;
  nextReviewDate: Date;
  reviewCount: number;
  easinessFactor: number;
  interval: number;
}

interface Deck {
  id: number;
  name: string;
  description: string;
  cardCount: number;
}

interface ReviewHistory {
  id: number;
  cardId: number;
  reviewDate: Date;
  quality: number;
  previousInterval: number;
  nextInterval: number;
}

export const calculateNextReview = (card: Card, quality: number): { nextReviewDate: Date, updatedCard: Card } => {
  const now = new Date();
  const { recallStrength, easinessFactor, interval, reviewCount } = card;

  // SM-2 algorithm implementation
  let newEasinessFactor = Math.max(1.3, easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;

  if (quality < 3) {
    // Incorrect recall - reset to 1 day
    newInterval = 1;
  } else {
    // Correct recall - calculate new interval
    if (reviewCount === 0) {
      newInterval = 1;
    } else if (reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEasinessFactor);
    }
  }

  // Update recall strength based on quality (1-5 scale)
  const newRecallStrength = Math.min(1, Math.max(0, recallStrength + (quality - 3) * 0.1));

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + newInterval);

  const updatedCard = {
    ...card,
    recallStrength: newRecallStrength,
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    nextReviewDate,
    reviewCount: reviewCount + 1
  };

  return { nextReviewDate, updatedCard };
};

export const initializeDatabase = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cardCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deckId INTEGER NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      recallStrength REAL DEFAULT 0.5,
      nextReviewDate TEXT NOT NULL,
      reviewCount INTEGER DEFAULT 0,
      easinessFactor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 1,
      FOREIGN KEY (deckId) REFERENCES decks(id)
    );

    CREATE TABLE IF NOT EXISTS review_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId INTEGER NOT NULL,
      reviewDate TEXT NOT NULL,
      quality INTEGER NOT NULL,
      previousInterval INTEGER NOT NULL,
      nextInterval INTEGER NOT NULL,
      FOREIGN KEY (cardId) REFERENCES cards(id)
    );

    CREATE INDEX IF NOT EXISTS idx_cards_deckId ON cards(deckId);
    CREATE INDEX IF NOT EXISTS idx_cards_nextReviewDate ON cards(nextReviewDate);
    CREATE INDEX IF NOT EXISTS idx_review_history_cardId ON review_history(cardId);
  `);
};

export const addDeck = async (db: SQLiteDatabase, name: string, description: string = ''): Promise<number> => {
  const result = await db.runAsync(
    'INSERT INTO decks (name, description) VALUES (?, ?)',
    [name, description]
  );
  return result.lastInsertRowId;
};

export const addCard = async (
  db: SQLiteDatabase,
  deckId: number,
  front: string,
  back: string
): Promise<number> => {
  const nextReviewDate = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO cards (deckId, front, back, nextReviewDate) VALUES (?, ?, ?, ?)',
    [deckId, front, back, nextReviewDate]
  );

  await db.runAsync(
    'UPDATE decks SET cardCount = cardCount + 1 WHERE id = ?',
    [deckId]
  );

  return result.lastInsertRowId;
};

export const addReview = async (
  db: SQLiteDatabase,
  cardId: number,
  quality: number
): Promise<void> => {
  const card = await db.getFirstAsync<Card>(
    'SELECT * FROM cards WHERE id = ?',
    [cardId]
  );

  if (!card) return;

  const { nextReviewDate, updatedCard } = calculateNextReview(card, quality);

  // Update card with new values
  await db.runAsync(
    'UPDATE cards SET recallStrength = ?, nextReviewDate = ?, reviewCount = ?, easinessFactor = ?, interval = ? WHERE id = ?',
    [
      updatedCard.recallStrength,
      updatedCard.nextReviewDate.toISOString(),
      updatedCard.reviewCount,
      updatedCard.easinessFactor,
      updatedCard.interval,
      cardId
    ]
  );

  // Add review history entry
  await db.runAsync(
    'INSERT INTO review_history (cardId, reviewDate, quality, previousInterval, nextInterval) VALUES (?, ?, ?, ?, ?)',
    [
      cardId,
      new Date().toISOString(),
      quality,
      card.interval,
      updatedCard.interval
    ]
  );
};

export const getDueCards = async (db: SQLiteDatabase, deckId: number): Promise<Card[]> => {
  const today = new Date().toISOString();
  const cards = await db.getAllAsync<Card>(
    'SELECT * FROM cards WHERE deckId = ? AND nextReviewDate <= ? ORDER BY nextReviewDate ASC',
    [deckId, today]
  );

  return cards.map(card => ({
    ...card,
    nextReviewDate: new Date(card.nextReviewDate)
  }));
};

export const getDeckStats = async (db: SQLiteDatabase, deckId: number): Promise<{
  totalCards: number;
  dueCards: number;
  averageRecallStrength: number;
}> => {
  const today = new Date().toISOString();

  const stats = await db.getFirstAsync<{
    totalCards: number;
    dueCards: number;
    sumRecallStrength: number;
  }>(`
    SELECT
      COUNT(*) as totalCards,
      SUM(CASE WHEN nextReviewDate <= ? THEN 1 ELSE 0 END) as dueCards,
      SUM(recallStrength) as sumRecallStrength
    FROM cards
    WHERE deckId = ?
  `, [today, deckId]);

  if (!stats) {
    return {
      totalCards: 0,
      dueCards: 0,
      averageRecallStrength: 0
    };
  }

  return {
    totalCards: stats.totalCards,
    dueCards: stats.dueCards,
    averageRecallStrength: stats.totalCards > 0
      ? stats.sumRecallStrength / stats.totalCards
      : 0
  };
};
