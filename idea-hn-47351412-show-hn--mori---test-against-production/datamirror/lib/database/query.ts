import * as SQLite from 'expo-sqlite';

export async function executeQuery(snapshotId, sql) {
  if (isWriteOperation(sql)) {
    throw new Error('Write operations not allowed');
  }

  if (!sql.trim()) {
    throw new Error('Query cannot be empty');
  }

  const db = SQLite.openDatabase(snapshotId);
  const startTime = Date.now();

  try {
    const result = await db.getAllAsync(sql);
    const duration = Date.now() - startTime;

    return {
      rows: result,
      rowCount: result.length,
      duration,
    };
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Query failed: ${error.message}`);
  }
}

function isWriteOperation(sql) {
  const writeKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE'];
  const upperSql = sql.toUpperCase();
  return writeKeywords.some((keyword) => upperSql.includes(keyword));
}
