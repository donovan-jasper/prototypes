export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  encrypted_password: string;
}

export interface DatabaseSchema {
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
    }[];
  }[];
}

export interface DatabaseData {
  name: string;
  rows: Record<string, any>[];
}
