export interface Table {
  name: string;
  columns: Column[];
  relationships?: Relationship[];
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

export const parsePostgresSchema = (schemaData: any[]): Table[] => {
  const tables: { [key: string]: Table } = {};

  schemaData.forEach(row => {
    if (!tables[row.table_name]) {
      tables[row.table_name] = {
        name: row.table_name,
        columns: [],
        relationships: [],
      };
    }

    tables[row.table_name].columns.push({
      name: row.column_name,
      type: row.data_type,
      isPrimaryKey: row.is_primary_key || false,
      isNullable: row.is_nullable === 'YES',
    });
  });

  return Object.values(tables);
};

export const parseTableRelationships = (constraints: any[]): Relationship[] => {
  return constraints.map(constraint => ({
    type: 'one-to-many', // Simplified for MVP
    table: constraint.table,
    column: constraint.column,
    foreignTable: constraint.foreign_table,
    foreignColumn: constraint.foreign_column,
  }));
};
