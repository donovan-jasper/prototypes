import { openDatabase } from './schema';

interface Chapter {
  id?: number;
  audiobookId: number;
  title: string;
  startTime: number;
  endTime: number;
  order?: number;
}

export const createChapters = async (audiobookId: number, chapters: Omit<Chapter, 'audiobookId'>[]) => {
  const db = await openDatabase();

  try {
    await db.transactionAsync(async (tx) => {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        await tx.executeSqlAsync(
          'INSERT INTO chapters (audiobookId, title, startTime, endTime, order) VALUES (?, ?, ?, ?, ?)',
          [audiobookId, chapter.title, chapter.startTime, chapter.endTime, i]
        );
      }
    });
  } catch (error) {
    console.error('Error creating chapters:', error);
    throw error;
  }
};

export const getChapters = async (audiobookId: number): Promise<Chapter[]> => {
  const db = await openDatabase();

  try {
    const result = await db.getAllAsync<Chapter>(
      'SELECT * FROM chapters WHERE audiobookId = ? ORDER BY order ASC',
      [audiobookId]
    );
    return result;
  } catch (error) {
    console.error('Error getting chapters:', error);
    throw error;
  }
};

export const updateChapter = async (id: number, chapter: Partial<Chapter>) => {
  const db = await openDatabase();

  try {
    const updates = [];
    const params = [];

    if (chapter.title !== undefined) {
      updates.push('title = ?');
      params.push(chapter.title);
    }
    if (chapter.startTime !== undefined) {
      updates.push('startTime = ?');
      params.push(chapter.startTime);
    }
    if (chapter.endTime !== undefined) {
      updates.push('endTime = ?');
      params.push(chapter.endTime);
    }
    if (chapter.order !== undefined) {
      updates.push('order = ?');
      params.push(chapter.order);
    }

    if (updates.length === 0) return;

    params.push(id);

    await db.runAsync(
      `UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw error;
  }
};

export const deleteChapter = async (id: number) => {
  const db = await openDatabase();

  try {
    await db.runAsync('DELETE FROM chapters WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw error;
  }
};

export const createChapter = async (audiobookId: number, chapter: Omit<Chapter, 'audiobookId'>) => {
  const db = await openDatabase();

  try {
    const result = await db.runAsync(
      'INSERT INTO chapters (audiobookId, title, startTime, endTime, order) VALUES (?, ?, ?, ?, ?)',
      [audiobookId, chapter.title, chapter.startTime, chapter.endTime, chapter.order || 0]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw error;
  }
};
