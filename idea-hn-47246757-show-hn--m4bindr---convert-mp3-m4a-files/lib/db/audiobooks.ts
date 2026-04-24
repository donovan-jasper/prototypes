import { openDatabase } from './schema';

interface Audiobook {
  id?: number;
  title: string;
  author: string;
  duration: number;
  filePath: string;
  coverArt: string | null;
  currentPosition?: number;
  createdAt?: string;
}

export const createAudiobook = async (audiobook: Omit<Audiobook, 'id' | 'createdAt'>): Promise<Audiobook> => {
  const db = await openDatabase();

  try {
    const result = await db.runAsync(
      'INSERT INTO audiobooks (title, author, duration, filePath, coverArt, currentPosition) VALUES (?, ?, ?, ?, ?, ?)',
      [audiobook.title, audiobook.author, audiobook.duration, audiobook.filePath, audiobook.coverArt, audiobook.currentPosition || 0]
    );

    return {
      ...audiobook,
      id: result.lastInsertRowId,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating audiobook:', error);
    throw error;
  }
};

export const getAudiobook = async (id: number): Promise<Audiobook> => {
  const db = await openDatabase();

  try {
    const result = await db.getFirstAsync<Audiobook>(
      'SELECT * FROM audiobooks WHERE id = ?',
      [id]
    );

    if (!result) {
      throw new Error('Audiobook not found');
    }

    return result;
  } catch (error) {
    console.error('Error getting audiobook:', error);
    throw error;
  }
};

export const getAudiobooks = async (): Promise<Audiobook[]> => {
  const db = await openDatabase();

  try {
    const result = await db.getAllAsync<Audiobook>(
      'SELECT * FROM audiobooks ORDER BY createdAt DESC'
    );
    return result;
  } catch (error) {
    console.error('Error getting audiobooks:', error);
    throw error;
  }
};

export const updateAudiobook = async (id: number, updates: Partial<Audiobook>) => {
  const db = await openDatabase();

  try {
    const updateFields = [];
    const params = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      params.push(updates.title);
    }
    if (updates.author !== undefined) {
      updateFields.push('author = ?');
      params.push(updates.author);
    }
    if (updates.duration !== undefined) {
      updateFields.push('duration = ?');
      params.push(updates.duration);
    }
    if (updates.filePath !== undefined) {
      updateFields.push('filePath = ?');
      params.push(updates.filePath);
    }
    if (updates.coverArt !== undefined) {
      updateFields.push('coverArt = ?');
      params.push(updates.coverArt);
    }
    if (updates.currentPosition !== undefined) {
      updateFields.push('currentPosition = ?');
      params.push(updates.currentPosition);
    }

    if (updateFields.length === 0) return;

    params.push(id);

    await db.runAsync(
      `UPDATE audiobooks SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating audiobook:', error);
    throw error;
  }
};

export const updateProgress = async (id: number, position: number) => {
  await updateAudiobook(id, { currentPosition: position });
};

export const deleteAudiobook = async (id: number) => {
  const db = await openDatabase();

  try {
    await db.transactionAsync(async (tx) => {
      // First delete chapters
      await tx.executeSqlAsync('DELETE FROM chapters WHERE audiobookId = ?', [id]);

      // Then delete the audiobook
      await tx.executeSqlAsync('DELETE FROM audiobooks WHERE id = ?', [id]);
    });
  } catch (error) {
    console.error('Error deleting audiobook:', error);
    throw error;
  }
};
