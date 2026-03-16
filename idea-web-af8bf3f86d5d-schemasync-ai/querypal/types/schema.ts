export interface Schema {
  tables: Table[];
  relationships: Relationship[];
}

export interface Table {
  name: string;
  columns: Column[];
  description?: string;
}

export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
  description?: string;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  table: string;
  column: string;
  foreignTable: string;
  foreignColumn: string;
  description?: string;
}
