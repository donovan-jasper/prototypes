import { SQLiteDatabase } from 'expo-sqlite';

interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  recallStrength: number;
  nextReviewDate: Date;
  reviewCount: number;
}

interface Deck {
  id: number;
  name: string;
  description: string;
  cardCount: number;
}

export const calculateNextReview = (lastReview: Date, recallStrength: number): Date => {
  const now = new Date();
  const daysSinceLastReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

  // SM-2 algorithm simplified
  let interval = 1;
  if (recallStrength >= 0.7) {
    interval = Math.max(1, Math.floor(interval * 1.5));
  } else {
    interval = 1;
  }

  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + interval);
  return nextReview;
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
      FOREIGN KEY (deckId) REFERENCES decks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_cards_deckId ON cards(deckId);
    CREATE INDEX IF NOT EXISTS idx_cards_nextReviewDate ON cards(nextReviewDate);
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

export const updateCardRecallStrength = async (
  db: SQLiteDatabase,
  cardId: number,
  isEasy: boolean
): Promise<void> => {
  const card = await db.getFirstAsync<Card>(
    'SELECT * FROM cards WHERE id = ?',
    [cardId]
  );

  if (!card) return;

  const lastReview = new Date(card.nextReviewDate);
  const newRecallStrength = Math.min(1, Math.max(0, card.recallStrength + (isEasy ? 0.2 : -0.15)));
  const nextReviewDate = calculateNextReview(lastReview, newRecallStrength).toISOString();

  await db.runAsync(
    'UPDATE cards SET recallStrength = ?, nextReviewDate = ?, reviewCount = reviewCount + 1 WHERE id = ?',
    [newRecallStrength, nextReviewDate, cardId]
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

  const totalCards = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deckId = ?',
    [deckId]
  );

  const dueCards = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deckId = ? AND nextReviewDate <= ?',
    [deckId, today]
  );

  const avgRecall = await db.getFirstAsync<{ avg: number }>(
    'SELECT AVG(recallStrength) as avg FROM cards WHERE deckId = ?',
    [deckId]
  );

  return {
    totalCards: totalCards?.count || 0,
    dueCards: dueCards?.count || 0,
    averageRecallStrength: avgRecall?.avg || 0.5
  };
};
