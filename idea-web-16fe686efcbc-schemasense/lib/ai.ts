import { Database } from 'expo-sqlite';
import { queryTemplates } from '../constants/queryTemplates';

interface SchemaInfo {
  tables: string[];
  columns: Record<string, string[]>;
  types: Record<string, Record<string, string>>;
}

export const generateSQL = async (naturalQuery: string, schema: SchemaInfo): Promise<string> => {
  try {
    // In a real implementation, this would call OpenAI API
    // For now, we'll use a simple pattern matching approach

    // Convert to lowercase for case-insensitive matching
    const query = naturalQuery.toLowerCase();

    // Check against common patterns
    if (query.includes('show all') || query.includes('list all')) {
      const table = schema.tables.find(t => query.includes(t.toLowerCase()));
      if (table) {
        return `SELECT * FROM ${table};`;
      }
    }

    if (query.includes('count') || query.includes('how many')) {
      const table = schema.tables.find(t => query.includes(t.toLowerCase()));
      if (table) {
        return `SELECT COUNT(*) FROM ${table};`;
      }
    }

    if (query.includes('average') || query.includes('avg')) {
      const table = schema.tables.find(t => query.includes(t.toLowerCase()));
      const column = schema.columns[table || '']?.find(c => query.includes(c.toLowerCase()));
      if (table && column) {
        return `SELECT AVG(${column}) FROM ${table};`;
      }
    }

    // If no pattern matched, return a simple SELECT
    return `SELECT * FROM ${schema.tables[0]} LIMIT 10;`;

  } catch (error) {
    console.error('SQL generation failed:', error);
    throw error;
  }
};

export const validateQuery = (sql: string): boolean => {
  // Basic SQL syntax validation
  const forbiddenPatterns = [
    /;.*;/, // Multiple statements
    /DROP\s+TABLE/i, // DROP TABLE
    /DELETE\s+FROM/i, // DELETE FROM
    /INSERT\s+INTO/i, // INSERT INTO
    /UPDATE\s+/i, // UPDATE
    /CREATE\s+TABLE/i, // CREATE TABLE
    /ALTER\s+TABLE/i, // ALTER TABLE
  ];

  return !forbiddenPatterns.some(pattern => pattern.test(sql));
};

export const explainQuery = async (sql: string): Promise<string> => {
  // In a real implementation, this would call OpenAI API
  // For now, we'll use a simple explanation

  if (sql.includes('SELECT *')) {
    return "This query will retrieve all columns from the specified table.";
  }

  if (sql.includes('COUNT')) {
    return "This query will count the number of rows in the specified table.";
  }

  if (sql.includes('AVG')) {
    return "This query will calculate the average value of the specified column.";
  }

  return "This query will retrieve data from the database.";
};

export const getOfflineQueryPattern = (naturalQuery: string): string | null => {
  // Check against predefined query patterns
  for (const pattern of queryTemplates) {
    if (naturalQuery.toLowerCase().includes(pattern.natural.toLowerCase())) {
      return pattern.sql;
    }
  }
  return null;
};
