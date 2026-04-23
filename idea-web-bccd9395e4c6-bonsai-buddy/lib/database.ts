import * as SQLite from 'expo-sqlite';
import { Plant, CareReminder, CommunityPost } from '../types';

const db = SQLite.openDatabase('plantpulse.db');

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT,
      wateringFrequency INTEGER,
      lastWatered TEXT,
      lastFertilized TEXT,
      photoUris TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS care_reminders (
      id TEXT PRIMARY KEY,
      plantId TEXT NOT NULL,
      type TEXT NOT NULL,
      scheduledFor TEXT NOT NULL,
      completed INTEGER NOT NULL,
      FOREIGN KEY (plantId) REFERENCES plants (id)
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      plantId TEXT NOT NULL,
      photoUri TEXT NOT NULL,
      caption TEXT,
      likes INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (plantId) REFERENCES plants (id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT UNIQUE NOT NULL,
      premiumStatus INTEGER DEFAULT 0,
      notificationPreferences TEXT,
      theme TEXT DEFAULT 'light',
      streak INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      userId TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (postId) REFERENCES community_posts (id)
    );
  `);
};

export const getUserSettings = async () => {
  const result = await db.getFirstAsync('SELECT * FROM user_settings LIMIT 1;');
  return result as {
    id: number;
    userId: string;
    premiumStatus: number;
    notificationPreferences: string;
    theme: string;
    streak?: number;
  } | null;
};

export const getCommunityPosts = async () => {
  const posts = await db.getAllAsync('SELECT * FROM community_posts ORDER BY createdAt DESC;');

  const postsWithComments = await Promise.all(posts.map(async (post: any) => {
    const comments = await db.getAllAsync(
      'SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC',
      [post.id]
    );
    return { ...post, comments };
  }));

  return postsWithComments;
};

export const addCommunityPost = async (post: Omit<CommunityPost, 'id'>) => {
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO community_posts (id, userId, plantId, photoUri, caption, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, post.userId, post.plantId, post.photoUri, post.caption, new Date().toISOString()]
  );
  return { ...post, id };
};

export const likePost = async (postId: string, userId: string) => {
  // Check if user already liked the post
  const existingLike = await db.getFirstAsync(
    'SELECT * FROM post_likes WHERE postId = ? AND userId = ?',
    [postId, userId]
  );

  if (existingLike) {
    // Unlike the post
    await db.runAsync(
      'DELETE FROM post_likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );
    await db.runAsync(
      'UPDATE community_posts SET likes = likes - 1 WHERE id = ?',
      [postId]
    );
  } else {
    // Like the post
    await db.runAsync(
      'INSERT INTO post_likes (postId, userId) VALUES (?, ?)',
      [postId, userId]
    );
    await db.runAsync(
      'UPDATE community_posts SET likes = likes + 1 WHERE id = ?',
      [postId]
    );
  }

  // Return updated like count
  const result = await db.getFirstAsync(
    'SELECT likes FROM community_posts WHERE id = ?',
    [postId]
  );
  return result?.likes || 0;
};

export const addComment = async (postId: string, userId: string, text: string) => {
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO comments (id, postId, userId, text, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, postId, userId, text, new Date().toISOString()]
  );
  return { id, postId, userId, text, createdAt: new Date().toISOString() };
};
