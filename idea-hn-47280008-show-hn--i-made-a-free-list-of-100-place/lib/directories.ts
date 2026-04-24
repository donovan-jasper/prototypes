import { getDatabase, Directory } from './database';

export async function getAllDirectories(): Promise<Directory[]> {
  const db = await getDatabase();
  const directories = await db.getAllAsync<Directory>(
    'SELECT * FROM directories ORDER BY drScore DESC'
  );
  return directories;
}

export async function getDirectoryById(id: string): Promise<Directory | null> {
  const db = await getDatabase();
  const directory = await db.getFirstAsync<Directory>(
    'SELECT * FROM directories WHERE id = ?',
    [id]
  );
  return directory || null;
}

export async function searchDirectories(query: string): Promise<Directory[]> {
  const db = await getDatabase();
  const searchTerm = `%${query}%`;
  const directories = await db.getAllAsync<Directory>(
    `SELECT * FROM directories
     WHERE name LIKE ? OR description LIKE ?
     ORDER BY drScore DESC`,
    [searchTerm, searchTerm]
  );
  return directories;
}

export async function getTopDirectories(
  category?: string,
  limit: number = 10
): Promise<Directory[]> {
  const db = await getDatabase();

  if (category) {
    const directories = await db.getAllAsync<Directory>(
      `SELECT * FROM directories
       WHERE category = ?
       ORDER BY drScore DESC
       LIMIT ?`,
      [category, limit]
    );
    return directories;
  }

  const directories = await db.getAllAsync<Directory>(
    'SELECT * FROM directories ORDER BY drScore DESC LIMIT ?',
    [limit]
  );
  return directories;
}

export async function getDirectoriesByCategory(category: string): Promise<Directory[]> {
  const db = await getDatabase();
  const directories = await db.getAllAsync<Directory>(
    'SELECT * FROM directories WHERE category = ? ORDER BY drScore DESC',
    [category]
  );
  return directories;
}

export async function getDirectoriesByCategories(categories: string[]): Promise<Directory[]> {
  if (categories.length === 0) {
    return getAllDirectories();
  }

  const db = await getDatabase();
  const placeholders = categories.map(() => '?').join(',');
  const directories = await db.getAllAsync<Directory>(
    `SELECT * FROM directories WHERE category IN (${placeholders}) ORDER BY drScore DESC`,
    categories
  );
  return directories;
}

export async function getPriorityRecommendations(
  category: string,
  limit: number = 10
): Promise<Directory[]> {
  const db = await getDatabase();

  // Calculate priority score: DR score × category match × approval rate
  // For simplicity, we'll use a weighted formula where:
  // - DR score is the primary factor (weight 0.6)
  // - Approval rate is secondary (weight 0.3)
  // - Category match is a binary factor (1.0 if matches, 0.5 if doesn't)
  const recommendations = await db.getAllAsync<Directory>(
    `SELECT *,
      (drScore * 0.6 +
       approvalRate * 0.3 +
       CASE WHEN category = ? THEN 1.0 ELSE 0.5 END) as priorityScore
     FROM directories
     ORDER BY priorityScore DESC
     LIMIT ?`,
    [category, limit]
  );

  return recommendations;
}
