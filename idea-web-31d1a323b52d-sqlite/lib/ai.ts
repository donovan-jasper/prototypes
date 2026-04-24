import { DatabaseField } from './database';

export interface ParsedCommand {
  action: 'create' | 'query' | 'insert' | 'unknown';
  tableName?: string;
  fields?: DatabaseField[];
  conditions?: string;
  sortBy?: string;
  groupBy?: string;
  limit?: number;
}

export const parseVoiceCommand = (text: string): ParsedCommand => {
  // Normalize text
  const normalized = text.toLowerCase().trim();

  // Create table command
  const createRegex = /create\s+(?:a\s+)?(\w+)\s+(?:database|table)\s+with\s+(.+)/i;
  const createMatch = normalized.match(createRegex);
  if (createMatch) {
    const tableName = createMatch[1];
    const fields = createMatch[2].split(/\s+and\s+|\s*,\s*/).map(field => ({
      name: field.trim(),
      type: 'TEXT' // Default type, can be enhanced with more sophisticated detection
    }));
    return { action: 'create', tableName, fields };
  }

  // Query commands
  const queryRegex = /(?:show|find|display|list)\s+(?:all\s+)?(\w+)(?:\s+where\s+(.+))?(?:\s+ordered\s+by\s+(.+))?(?:\s+grouped\s+by\s+(.+))?(?:\s+limit\s+(\d+))?/i;
  const queryMatch = normalized.match(queryRegex);
  if (queryMatch) {
    const tableName = queryMatch[1];
    const conditions = queryMatch[2];
    const sortBy = queryMatch[3];
    const groupBy = queryMatch[4];
    const limit = queryMatch[5] ? parseInt(queryMatch[5]) : undefined;

    return {
      action: 'query',
      tableName,
      conditions,
      sortBy,
      groupBy,
      limit
    };
  }

  // Insert commands
  const insertRegex = /(?:add|insert|create)\s+(?:a\s+)?(\w+)\s+with\s+(.+)/i;
  const insertMatch = normalized.match(insertRegex);
  if (insertMatch) {
    const tableName = insertMatch[1];
    // Simple field-value parsing - could be enhanced
    const fieldValues = insertMatch[2].split(/\s*,\s*/).reduce((acc, pair) => {
      const [key, value] = pair.split(/\s*:\s*/);
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      action: 'insert',
      tableName,
      fields: Object.entries(fieldValues).map(([name, value]) => ({
        name,
        type: 'TEXT', // Default type
        value
      }))
    };
  }

  return { action: 'unknown' };
};

export const generateSQL = (parsed: ParsedCommand, schema?: Record<string, DatabaseField[]>): string => {
  if (parsed.action === 'create' && parsed.tableName && parsed.fields) {
    const fieldsSQL = parsed.fields.map(field => `${field.name} ${field.type}`).join(', ');
    return `CREATE TABLE IF NOT EXISTS ${parsed.tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${fieldsSQL})`;
  }

  if (parsed.action === 'query' && parsed.tableName) {
    let sql = `SELECT * FROM ${parsed.tableName}`;

    if (parsed.conditions) {
      // Basic condition parsing - could be enhanced with schema validation
      sql += ` WHERE ${parsed.conditions}`;
    }

    if (parsed.groupBy) {
      sql += ` GROUP BY ${parsed.groupBy}`;
    }

    if (parsed.sortBy) {
      sql += ` ORDER BY ${parsed.sortBy}`;
    }

    if (parsed.limit) {
      sql += ` LIMIT ${parsed.limit}`;
    }

    return sql;
  }

  if (parsed.action === 'insert' && parsed.tableName && parsed.fields) {
    const columns = parsed.fields.map(field => field.name).join(', ');
    const values = parsed.fields.map(field => `'${field.value?.replace(/'/g, "''")}'`).join(', ');
    return `INSERT INTO ${parsed.tableName} (${columns}) VALUES (${values})`;
  }

  return 'SELECT 1'; // Default safe query
};

export const analyzeSchemaForQuery = (query: string, schema: Record<string, DatabaseField[]>): string => {
  // This would be enhanced with actual schema analysis
  // For now, just return the query as-is
  return query;
};
