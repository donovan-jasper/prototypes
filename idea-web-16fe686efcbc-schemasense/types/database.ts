export interface DatabaseSchema {
  tables: string[];
  columns: Record<string, string[]>;
  types?: Record<string, Record<string, string>>;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  affectedRows?: number;
  lastInsertRowId?: number;
}
