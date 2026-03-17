import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('giftswift.db');
  }
  return db;
}

export async function initDatabase() {
  const database = await getDatabase();

  // Create tables
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      imageUrl TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      preferences TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sent_gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giftId INTEGER NOT NULL,
      recipientId INTEGER NOT NULL,
      message TEXT,
      status TEXT NOT NULL,
      sentAt TEXT NOT NULL,
      redeemedAt TEXT,
      FOREIGN KEY (giftId) REFERENCES gifts(id),
      FOREIGN KEY (recipientId) REFERENCES recipients(id)
    );
  `);

  // Check if we already have seed data
  const existingGifts = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM gifts'
  );

  if (existingGifts && existingGifts.count === 0) {
    // Insert seed data
    const now = new Date().toISOString();

    const seedGifts = [
      // Wellness (3 gifts)
      {
        title: 'Luxury Spa Day Package',
        category: 'wellness',
        price: 149.99,
        description: 'Full day spa experience including massage, facial, and access to all facilities',
        imageUrl: '',
      },
      {
        title: 'Yoga & Meditation Retreat',
        category: 'wellness',
        price: 89.99,
        description: 'Half-day wellness retreat with guided yoga and meditation sessions',
        imageUrl: '',
      },
      {
        title: 'Premium Massage Session',
        category: 'wellness',
        price: 79.99,
        description: '90-minute therapeutic massage with aromatherapy',
        imageUrl: '',
      },
      // Entertainment (3 gifts)
      {
        title: 'Concert Tickets - Premium Seats',
        category: 'entertainment',
        price: 199.99,
        description: 'Two premium tickets to see top artists at major venues',
        imageUrl: '',
      },
      {
        title: 'Movie Night Experience',
        category: 'entertainment',
        price: 49.99,
        description: 'Two movie tickets plus popcorn and drinks at premium theaters',
        imageUrl: '',
      },
      {
        title: 'Streaming Service Annual Pass',
        category: 'entertainment',
        price: 119.99,
        description: 'One year subscription to premium streaming service',
        imageUrl: '',
      },
      // Food (3 gifts)
      {
        title: 'Fine Dining Experience',
        category: 'food',
        price: 175.00,
        description: 'Three-course meal for two at a Michelin-starred restaurant',
        imageUrl: '',
      },
      {
        title: 'Gourmet Food Basket',
        category: 'food',
        price: 69.99,
        description: 'Curated selection of artisan cheeses, wines, and chocolates',
        imageUrl: '',
      },
      {
        title: 'Cooking Class Experience',
        category: 'food',
        price: 95.00,
        description: 'Hands-on cooking class with professional chef',
        imageUrl: '',
      },
      // Experiences (3 gifts)
      {
        title: 'Hot Air Balloon Ride',
        category: 'experiences',
        price: 249.99,
        description: 'Sunrise hot air balloon adventure with champagne toast',
        imageUrl: '',
      },
      {
        title: 'Wine Tasting Tour',
        category: 'experiences',
        price: 129.99,
        description: 'Guided tour of local wineries with tastings and lunch',
        imageUrl: '',
      },
      {
        title: 'Adventure Sports Package',
        category: 'experiences',
        price: 159.99,
        description: 'Choose from zip-lining, rock climbing, or kayaking adventures',
        imageUrl: '',
      },
    ];

    for (const gift of seedGifts) {
      await database.runAsync(
        `INSERT INTO gifts (title, category, price, description, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [gift.title, gift.category, gift.price, gift.description, gift.imageUrl, now]
      );
    }
  }
}
