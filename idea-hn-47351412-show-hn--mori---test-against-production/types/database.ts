// Existing types in database.ts (if any)
// ...

export interface ColumnSchema {
  name: string;
  type: string;
  // Add more properties if needed for a richer schema comparison
  // isNullable?: boolean;
  // defaultValue?: string | null;
  // isPrimaryKey?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface SchemaDiffReportItem {
  id: string; // Unique ID for the diff item
  type: 'added' | 'removed'; // 'added' or 'removed'
  diffType: 'table' | 'column'; // 'table' or 'column'
  tableName: string;
  columns?: ColumnSchema[]; // All columns if diffType is 'table', or only changed columns if diffType is 'column'
}

// Example of a connection type (from spec)
export type DatabaseType = 'postgres' | 'mysql' | 'sqlite';

export interface Connection {
  id: string;
  name: string;
  type: DatabaseType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string; // Should be encrypted in real app
}
