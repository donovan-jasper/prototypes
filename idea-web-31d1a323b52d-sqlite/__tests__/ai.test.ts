import { parseVoiceCommand, generateSQL } from '../lib/ai';

describe('AI query generation', () => {
  it('parses voice command to create table', () => {
    const result = parseVoiceCommand('create customer database with name and email');
    expect(result.action).toBe('create');
    expect(result.fields).toContainEqual({ name: 'name', type: 'TEXT' });
    expect(result.fields).toContainEqual({ name: 'email', type: 'TEXT' });
  });

  it('generates SQL from natural language', () => {
    const sql = generateSQL('show customers who joined this month', 'customers');
    expect(sql).toContain('SELECT');
    expect(sql).toContain('WHERE');
  });
});
