import * as SQLite from 'expo-sqlite';
import { db as firebaseDB } from '../../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const db = SQLite.openDatabase('pageturner.db');

interface ContentItem {
  id: number;
  title: string;
  commentCount?: number;
  lastActivity?: number;
}

interface Comment {
  id: string;
  contentId: number;
  author_name: string;
  comment_text: string;
  timestamp: number;
}

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY, title TEXT);',
        [],
        () => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, contentId INTEGER, author_name TEXT, comment_text TEXT, timestamp INTEGER);',
            [],
            () => resolve(true),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllContent = async (): Promise<ContentItem[]> => {
  try {
    // First get local content
    const localContent = await new Promise<ContentItem[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM content;',
          [],
          (_, { rows }) => {
            const content = rows._array.map(item => ({
              id: item.id,
              title: item.title,
              commentCount: 0,
              lastActivity: 0
            }));
            resolve(content);
          },
          (_, error) => reject(error)
        );
      });
    });

    // Then get comment stats from Firebase
    const contentWithStats = await Promise.all(localContent.map(async (item) => {
      const commentsQuery = query(
        collection(firebaseDB, 'comments'),
        where('contentId', '==', item.id),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(commentsQuery);
      const comments = querySnapshot.docs.map(doc => doc.data() as Comment);

      return {
        ...item,
        commentCount: comments.length,
        lastActivity: comments.length > 0 ? comments[0].timestamp : 0
      };
    }));

    return contentWithStats;
  } catch (error) {
    console.error('Error getting content:', error);
    return [];
  }
};

export const getComments = async (contentId: number): Promise<Comment[]> => {
  try {
    // First get local comments
    const localComments = await new Promise<Comment[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM comments WHERE contentId = ? ORDER BY timestamp DESC;',
          [contentId],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => reject(error)
        );
      });
    });

    // Then get Firebase comments
    const firebaseCommentsQuery = query(
      collection(firebaseDB, 'comments'),
      where('contentId', '==', contentId),
      orderBy('timestamp', 'desc')
    );

    const firebaseSnapshot = await getDocs(firebaseCommentsQuery);
    const firebaseComments = firebaseSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));

    // Merge and deduplicate
    const allComments = [...localComments, ...firebaseComments];
    const uniqueComments = Array.from(new Map(allComments.map(item => [item.id, item])).values());

    return uniqueComments.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

export const addComment = async (contentId: number, authorName: string, commentText: string): Promise<void> => {
  try {
    const timestamp = Date.now();

    // Add to local database
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO comments (contentId, author_name, comment_text, timestamp) VALUES (?, ?, ?, ?);',
          [contentId, authorName, commentText, timestamp],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });

    // Add to Firebase
    await addDoc(collection(firebaseDB, 'comments'), {
      contentId,
      authorName,
      commentText,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const syncContent = async (contentItems: ContentItem[]): Promise<void> => {
  try {
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Clear existing content
        tx.executeSql('DELETE FROM content;', [], () => {
          // Insert new content
          contentItems.forEach(item => {
            tx.executeSql(
              'INSERT INTO content (id, title) VALUES (?, ?);',
              [item.id, item.title],
              () => {},
              (_, error) => console.error('Error inserting content:', error)
            );
          });
          resolve(true);
        }, (_, error) => reject(error));
      });
    });
  } catch (error) {
    console.error('Error syncing content:', error);
    throw error;
  }
};
