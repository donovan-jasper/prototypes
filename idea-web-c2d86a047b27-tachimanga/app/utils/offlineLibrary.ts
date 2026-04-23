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

interface AutoDownloadSettings {
  auto_download_enabled: number;
  last_auto_download: number;
}

interface AutoDownloadedContent {
  id: number;
  title: string;
  downloaded_at: number;
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
                () => {
                  tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS auto_download_settings (id INTEGER PRIMARY KEY, auto_download_enabled INTEGER, last_auto_download INTEGER);',
                    [],
                    () => {
                      tx.executeSql(
                        'INSERT OR IGNORE INTO auto_download_settings (id, auto_download_enabled, last_auto_download) VALUES (1, 0, 0);',
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

    // Check if we should auto-download next content
    if (percentageComplete >= 90) {
      const settings = await getAutoDownloadSettings();
      if (settings.auto_download_enabled === 1) {
        const lastDownload = settings.last_auto_download || 0;
        const oneDay = 24 * 60 * 60 * 1000;

        if (Date.now() - lastDownload > oneDay) {
          // Auto-download next content
          await autoDownloadNextContent(contentId);
          await updateAutoDownloadSettings({ last_auto_download: Date.now() });
        }
      }
    }
  } catch (error) {
    console.error('Error saving reading progress:', error);
    throw error;
  }
};

export const getInProgressContent = async (): Promise<ReadingProgress[]> => {
  try {
    const localProgress = await new Promise<ReadingProgress[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM reading_progress WHERE percentage_complete > 0 ORDER BY last_updated DESC LIMIT 5;',
          [],
          (_, { rows }) => {
            const progressItems = [];
            for (let i = 0; i < rows.length; i++) {
              progressItems.push(rows.item(i));
            }
            resolve(progressItems);
          },
          (_, error) => reject(error)
        );
      });
    });

    return localProgress;
  } catch (error) {
    console.error('Error getting in-progress content:', error);
    return [];
  }
};

export const getAutoDownloadSettings = async (): Promise<AutoDownloadSettings> => {
  try {
    const settings = await new Promise<AutoDownloadSettings>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM auto_download_settings WHERE id = 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              resolve({ auto_download_enabled: 0, last_auto_download: 0 });
            }
          },
          (_, error) => reject(error)
        );
      });
    });

    return settings;
  } catch (error) {
    console.error('Error getting auto-download settings:', error);
    return { auto_download_enabled: 0, last_auto_download: 0 };
  }
};

export const setAutoDownloadEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE auto_download_settings SET auto_download_enabled = ? WHERE id = 1;',
          [enabled ? 1 : 0],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  } catch (error) {
    console.error('Error setting auto-download enabled:', error);
    throw error;
  }
};

export const updateAutoDownloadSettings = async (settings: Partial<AutoDownloadSettings>): Promise<void> => {
  try {
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        const updates = [];
        const params = [];

        if (settings.auto_download_enabled !== undefined) {
          updates.push('auto_download_enabled = ?');
          params.push(settings.auto_download_enabled);
        }

        if (settings.last_auto_download !== undefined) {
          updates.push('last_auto_download = ?');
          params.push(settings.last_auto_download);
        }

        if (updates.length > 0) {
          tx.executeSql(
            `UPDATE auto_download_settings SET ${updates.join(', ')} WHERE id = 1;`,
            params,
            () => resolve(true),
            (_, error) => reject(error)
          );
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error updating auto-download settings:', error);
    throw error;
  }
};

export const autoDownloadNextContent = async (currentContentId: number): Promise<void> => {
  try {
    // In a real app, this would fetch the next content from the server
    // For this example, we'll just simulate downloading a new content item
    const nextContentId = currentContentId + 1;
    const nextContent = {
      id: nextContentId,
      title: `Chapter ${nextContentId}`,
      text: `This is the text for chapter ${nextContentId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      downloaded_at: Date.now()
    };

    // Save to local database
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO content (id, title, text) VALUES (?, ?, ?);',
          [nextContent.id, nextContent.title, nextContent.text],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });

    // Add to auto-downloaded content
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO auto_downloaded_content (id, title, downloaded_at) VALUES (?, ?, ?);',
          [nextContent.id, nextContent.title, nextContent.downloaded_at],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  } catch (error) {
    console.error('Error auto-downloading next content:', error);
    throw error;
  }
};

export const getAutoDownloadedContent = async (): Promise<AutoDownloadedContent[]> => {
  try {
    const autoDownloaded = await new Promise<AutoDownloadedContent[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM auto_downloaded_content ORDER BY downloaded_at DESC;',
          [],
          (_, { rows }) => {
            const items = [];
            for (let i = 0; i < rows.length; i++) {
              items.push(rows.item(i));
            }
            resolve(items);
          },
          (_, error) => reject(error)
        );
      });
    });

    return autoDownloaded;
  } catch (error) {
    console.error('Error getting auto-downloaded content:', error);
    return [];
  }
};

export const clearAutoDownloadNotifications = async (): Promise<void> => {
  try {
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM auto_downloaded_content;',
          [],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  } catch (error) {
    console.error('Error clearing auto-download notifications:', error);
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
            const content = [];
            for (let i = 0; i < rows.length; i++) {
              content.push(rows.item(i));
            }
            resolve(content);
          },
          (_, error) => reject(error)
        );
      });
    });

    return localContent;
  } catch (error) {
    console.error('Error getting all content:', error);
    return [];
  }
};
