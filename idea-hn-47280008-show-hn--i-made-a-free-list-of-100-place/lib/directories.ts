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

  // Calculate priority score: (DR score × 0.5) + (category match × 0.3) + (approval rate × 0.2)
  const recommendations = await db.getAllAsync<Directory>(
    `SELECT *,
      (drScore * 0.5 +
       CASE WHEN category = ? THEN 1.0 ELSE 0.5 END * 0.3 +
       approvalRate * 0.2) as priorityScore
     FROM directories
     ORDER BY priorityScore DESC
     LIMIT ?`,
    [category, limit]
  );

  return recommendations;
}

export async function calculatePriorityScore(
  directory: Directory,
  userCategory: string
): Promise<number> {
  // DR score (50%) + category match (30%) + approval rate (20%)
  const categoryMatch = directory.category === userCategory ? 1.0 : 0.5;
  return (directory.drScore * 0.5) + (categoryMatch * 0.3) + (directory.approvalRate * 0.2);
}
