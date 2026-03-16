export interface Database {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'supabase';
  connectionString: string;
  lastSync: Date;
  schema?: Schema;
}

export interface Schema {
  tables: Table[];
  relationships: Relationship[];
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  table: string;
  column: string;
  foreignTable: string;
  foreignColumn: string;
}
