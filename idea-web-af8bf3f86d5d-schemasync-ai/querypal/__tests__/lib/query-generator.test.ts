import { generateSQLFromNaturalLanguage } from '@/lib/ai/query-generator';

describe('Query Generator', () => {
  test('converts natural language to SQL', async () => {
    const schema = { tables: [{ name: 'users', columns: ['id', 'email', 'created_at'] }] };
    const query = await generateSQLFromNaturalLanguage(
      'Show me all users created last week',
      schema
    );
    expect(query).toContain('SELECT');
    expect(query).toContain('users');
    expect(query).toContain('created_at');
  });

  test('handles invalid queries gracefully', async () => {
    const schema = { tables: [] };
    await expect(
      generateSQLFromNaturalLanguage('Delete all data', schema)
    ).rejects.toThrow('Destructive queries not allowed');
  });
});
