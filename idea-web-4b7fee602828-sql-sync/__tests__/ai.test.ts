import { generateSchema, naturalLanguageQuery } from '../lib/ai';

jest.mock('../lib/ai', () => ({
  generateSchema: jest.fn(),
  naturalLanguageQuery: jest.fn()
}));

describe('AI features', () => {
  test('generates schema from voice input', async () => {
    (generateSchema as jest.Mock).mockResolvedValue([
      { name: 'client_name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    const schema = await generateSchema('client tracker with name and email');
    expect(schema.length).toBe(2);
    expect(schema[0].name).toBe('client_name');
  });

  test('converts natural language to SQL', async () => {
    (naturalLanguageQuery as jest.Mock).mockResolvedValue('SELECT * FROM rows WHERE status = "pending"');
    const sql = await naturalLanguageQuery('show pending clients');
    expect(sql).toContain('pending');
  });
});
