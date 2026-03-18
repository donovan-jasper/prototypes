import { getDatabase } from './database';
import directoriesData from '@/constants/directories.json';

export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();

  // Check if already seeded
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM directories'
  );

  if (result && result.count > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database with directories...');

  // Insert directories
  const insertStatement = await db.prepareAsync(
    `INSERT INTO directories (id, name, url, category, description, drScore, submissionDifficulty, avgApprovalTime, cost, requirements)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  try {
    for (const directory of directoriesData) {
      await insertStatement.executeAsync([
        directory.id,
        directory.name,
        directory.url,
        directory.category,
        directory.description,
        directory.drScore,
        directory.submissionDifficulty,
        directory.avgApprovalTime,
        directory.cost,
        directory.requirements,
      ]);
    }
    console.log(`Seeded ${directoriesData.length} directories`);
  } finally {
    await insertStatement.finalizeAsync();
  }
}
