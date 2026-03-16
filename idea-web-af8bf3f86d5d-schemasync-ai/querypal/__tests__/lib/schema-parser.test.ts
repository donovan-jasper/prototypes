import { parsePostgresSchema, parseTableRelationships } from '@/lib/database/schema-parser';

describe('Schema Parser', () => {
  test('parses PostgreSQL table metadata', () => {
    const mockSchema = [
      { table_name: 'users', column_name: 'id', data_type: 'integer' },
      { table_name: 'users', column_name: 'email', data_type: 'varchar' }
    ];
    const result = parsePostgresSchema(mockSchema);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('users');
    expect(result[0].columns).toHaveLength(2);
  });

  test('identifies foreign key relationships', () => {
    const mockConstraints = [
      { table: 'posts', column: 'user_id', foreign_table: 'users', foreign_column: 'id' }
    ];
    const relationships = parseTableRelationships(mockConstraints);
    expect(relationships).toHaveLength(1);
    expect(relationships[0].type).toBe('one-to-many');
  });
});
