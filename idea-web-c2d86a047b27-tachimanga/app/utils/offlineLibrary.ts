import * as SQLite from 'expo-sqlite';
import { db as firebaseDB } from '../../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';

const db = SQLite.openDatabase('pageturner.db');

interface ContentItem {
  id: number;
  title: string;
  text: string;
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

interface ReadingProgress {
  contentId: number;
  scroll_position: number;
  percentage_complete: number;
  last_updated: number;
}

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY, title TEXT, text TEXT);',
        [],
        () => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, contentId INTEGER, author_name TEXT, comment_text TEXT, timestamp INTEGER);',
            [],
            () => {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS reading_progress (contentId INTEGER PRIMARY KEY, scroll_position REAL, percentage_complete REAL, last_updated INTEGER);',
                [],
                () => resolve(true),
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getContent = async (contentId: number): Promise<ContentItem> => {
  try {
    // First try to get from local database
    const localContent = await new Promise<ContentItem>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM content WHERE id = ?;',
          [contentId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              reject(new Error('Content not found locally'));
            }
          },
          (_, error) => reject(error)
        );
      });
    });

    return localContent;
  } catch (error) {
    console.error('Error getting content:', error);
    throw error;
  }
};

export const getReadingProgress = async (contentId: number): Promise<ReadingProgress | null> => {
  try {
    // First try to get from local database
    const localProgress = await new Promise<ReadingProgress | null>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM reading_progress WHERE contentId = ?;',
          [contentId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });

    if (localProgress) {
      return localProgress;
    }

    // If not found locally, try to get from Firebase
    const progressDocRef = doc(firebaseDB, 'reading_progress', contentId.toString());
    const progressDoc = await getDoc(progressDocRef);

    if (progressDoc.exists()) {
      const progressData = progressDoc.data();
      return {
        contentId,
        scroll_position: progressData.scroll_position,
        percentage_complete: progressData.percentage_complete,
        last_updated: progressData.last_updated.toMillis()
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting reading progress:', error);
    return null;
  }
};

export const saveReadingProgress = async (contentId: number, scrollPosition: number, percentageComplete: number): Promise<void> => {
  const timestamp = Date.now();

  try {
    // Save to local database
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO reading_progress (contentId, scroll_position, percentage_complete, last_updated) VALUES (?, ?, ?, ?);',
          [contentId, scrollPosition, percentageComplete, timestamp],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });

    // Save to Firebase
    const progressDocRef = doc(firebaseDB, 'reading_progress', contentId.toString());
    await setDoc(progressDocRef, {
      scroll_position: scrollPosition,
      percentage_complete: percentageComplete,
      last_updated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving reading progress:', error);
    throw error;
  }
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
              text: item.text,
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
              'INSERT INTO content (id, title, text) VALUES (?, ?, ?);',
              [item.id, item.title, item.text],
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

export const getInProgressContent = async (): Promise<ReadingProgress[]> => {
  try {
    // First get from local database
    const localProgress = await new Promise<ReadingProgress[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT rp.*, c.title FROM reading_progress rp JOIN content c ON rp.contentId = c.id ORDER BY rp.last_updated DESC;',
          [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => reject(error)
        );
      });
    });

    // Then get from Firebase
    const firebaseProgressQuery = query(
      collection(firebaseDB, 'reading_progress'),
      orderBy('last_updated', 'desc')
    );

    const firebaseSnapshot = await getDocs(firebaseProgressQuery);
    const firebaseProgress = firebaseSnapshot.docs.map(doc => ({
      contentId: parseInt(doc.id),
      ...doc.data(),
      last_updated: doc.data().last_updated.toMillis()
    } as ReadingProgress));

    // Merge and deduplicate
    const allProgress = [...localProgress, ...firebaseProgress];
    const uniqueProgress = Array.from(new Map(allProgress.map(item => [item.contentId, item])).values());

    return uniqueProgress.sort((a, b) => b.last_updated - a.last_updated);
  } catch (error) {
    console.error('Error getting in-progress content:', error);
    return [];
  }
};

export const getAutoDownloadSettings = async (): Promise<{ auto_download_enabled: number }> => {
  try {
    // In a real app, you would store this in local storage or Firebase
    // For this example, we'll return a default value
    return { auto_download_enabled: 1 };
  } catch (error) {
    console.error('Error getting auto-download settings:', error);
    return { auto_download_enabled: 0 };
  }
};

export const setAutoDownloadEnabled = async (enabled: boolean): Promise<void> => {
  try {
    // In a real app, you would save this to local storage or Firebase
    console.log(`Auto-download ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting auto-download:', error);
    throw error;
  }
};

export const getAutoDownloadedContent = async (): Promise<ContentItem[]> => {
  try {
    // In a real app, you would track this in your database
    // For this example, we'll return some mock data
    return [
      { id: 1, title: 'Chapter 2', text: '...', commentCount: 0, lastActivity: 0 },
      { id: 2, title: 'Chapter 3', text: '...', commentCount: 0, lastActivity: 0 }
    ];
  } catch (error) {
    console.error('Error getting auto-downloaded content:', error);
    return [];
  }
};

export const clearAutoDownloadNotifications = async (): Promise<void> => {
  try {
    // In a real app, you would clear the notifications
    console.log('Auto-download notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
};
