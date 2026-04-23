import { Table, Column, Relationship } from '../../types/schema';

export const parsePostgresSchema = (rawSchema: any[]): Table[] => {
  const tablesMap: Record<string, Table> = {};

  rawSchema.forEach(row => {
    if (!tablesMap[row.table_name]) {
      tablesMap[row.table_name] = {
        name: row.table_name,
        columns: [],
        primaryKey: null,
        indexes: []
      };
    }

    const column: Column = {
      name: row.column_name,
      type: row.data_type,
      isNullable: row.is_nullable === 'YES',
      isPrimaryKey: false // We'll determine this in the next step
    };

    tablesMap[row.table_name].columns.push(column);
  });

  // Convert to array
  return Object.values(tablesMap);
};

export const parseTableRelationships = (rawConstraints: any[]): Relationship[] => {
  return rawConstraints.map(constraint => ({
    fromTable: constraint.table,
    fromColumn: constraint.column,
    toTable: constraint.foreign_table,
    toColumn: constraint.foreign_column,
    type: 'one-to-many' // Default relationship type
  }));
};
