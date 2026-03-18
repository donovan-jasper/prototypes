import { getDatabase, Submission } from './database';

export async function createSubmission(
  directoryId: string,
  status: 'not_started' | 'submitted' | 'approved' | 'rejected' = 'not_started',
  notes: string = ''
): Promise<number> {
  const db = await getDatabase();
  const submissionDate = status === 'submitted' ? new Date().toISOString() : '';
  
  const result = await db.runAsync(
    'INSERT INTO submissions (directoryId, status, notes, submissionDate) VALUES (?, ?, ?, ?)',
    [directoryId, status, notes, submissionDate]
  );
  
  return result.lastInsertRowId;
}

export async function updateSubmissionStatus(
  id: number,
  status: 'not_started' | 'submitted' | 'approved' | 'rejected',
  notes?: string
): Promise<void> {
  const db = await getDatabase();
  const submissionDate = status === 'submitted' ? new Date().toISOString() : '';
  
  if (notes !== undefined) {
    await db.runAsync(
      'UPDATE submissions SET status = ?, notes = ?, submissionDate = ? WHERE id = ?',
      [status, notes, submissionDate, id]
    );
  } else {
    await db.runAsync(
      'UPDATE submissions SET status = ?, submissionDate = ? WHERE id = ?',
      [status, submissionDate, id]
    );
  }
}

export async function getSubmissionsByStatus(
  status?: 'not_started' | 'submitted' | 'approved' | 'rejected'
): Promise<Submission[]> {
  const db = await getDatabase();
  
  if (status) {
    return await db.getAllAsync<Submission>(
      'SELECT * FROM submissions WHERE status = ? ORDER BY submissionDate DESC',
      [status]
    );
  }
  
  return await db.getAllAsync<Submission>(
    'SELECT * FROM submissions ORDER BY submissionDate DESC'
  );
}

export async function getSubmissionByDirectoryId(directoryId: string): Promise<Submission | null> {
  const db = await getDatabase();
  const submission = await db.getFirstAsync<Submission>(
    'SELECT * FROM submissions WHERE directoryId = ?',
    [directoryId]
  );
  return submission || null;
}

export async function deleteSubmission(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM submissions WHERE id = ?', [id]);
}

export async function getCompletionPercentage(): Promise<number> {
  const db = await getDatabase();
  
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM directories'
  );
  
  const submittedResult = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM submissions WHERE status IN ('submitted', 'approved')"
  );
  
  const total = totalResult?.count || 0;
  const submitted = submittedResult?.count || 0;
  
  if (total === 0) return 0;
  
  return Math.round((submitted / total) * 100);
}
