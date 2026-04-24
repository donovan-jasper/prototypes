import { parseVoiceCommand, generateSQL, ParsedCommand } from '../lib/ai';

describe('AI query generation', () => {
  it('parses voice command to create table', () => {
    const result = parseVoiceCommand('create customer database with name and email');
    expect(result.action).toBe('create');
    expect(result.tableName).toBe('customer');
    expect(result.fields).toContainEqual({ name: 'name', type: 'TEXT' });
    expect(result.fields).toContainEqual({ name: 'email', type: 'TEXT' });
  });

  it('parses voice command with different phrasing', () => {
    const result = parseVoiceCommand('make a new inventory table with product name, quantity, and price');
    expect(result.action).toBe('create');
    expect(result.tableName).toBe('inventory');
    expect(result.fields).toHaveLength(3);
  });

  it('parses query command with conditions', () => {
    const result = parseVoiceCommand('show customers where status is active');
    expect(result.action).toBe('query');
    expect(result.tableName).toBe('customers');
    expect(result.conditions).toBe('status is active');
  });

  it('parses query command with sorting', () => {
    const result = parseVoiceCommand('find products ordered by price descending');
    expect(result.action).toBe('query');
    expect(result.tableName).toBe('products');
    expect(result.sortBy).toBe('price descending');
  });

  it('parses query command with grouping and limit', () => {
    const result = parseVoiceCommand('list orders grouped by customer limit 10');
    expect(result.action).toBe('query');
    expect(result.tableName).toBe('orders');
    expect(result.groupBy).toBe('customer');
    expect(result.limit).toBe(10);
  });

  it('parses insert command', () => {
    const result = parseVoiceCommand('add customer with name: John Doe, email: john@example.com');
    expect(result.action).toBe('insert');
    expect(result.tableName).toBe('customer');
    expect(result.fields).toContainEqual({
      name: 'name',
      type: 'TEXT',
      value: 'John Doe'
    });
    expect(result.fields).toContainEqual({
      name: 'email',
      type: 'TEXT',
      value: 'john@example.com'
    });
  });

  it('generates CREATE TABLE SQL', () => {
    const parsed: ParsedCommand = {
      action: 'create',
      tableName: 'customers',
      fields: [
        { name: 'name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' }
      ]
    };
    const sql = generateSQL(parsed);
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS customers');
    expect(sql).toContain('name TEXT');
    expect(sql).toContain('email TEXT');
  });

  it('generates SELECT query with conditions', () => {
    const parsed: ParsedCommand = {
      action: 'query',
      tableName: 'customers',
      conditions: 'status = "active"',
      sortBy: 'name ASC',
      limit: 10
    };
    const sql = generateSQL(parsed);
    expect(sql).toContain('SELECT * FROM customers');
    expect(sql).toContain('WHERE status = "active"');
    expect(sql).toContain('ORDER BY name ASC');
    expect(sql).toContain('LIMIT 10');
  });

  it('generates INSERT statement', () => {
    const parsed: ParsedCommand = {
      action: 'insert',
      tableName: 'customers',
      fields: [
        { name: 'name', type: 'TEXT', value: 'John Doe' },
        { name: 'email', type: 'TEXT', value: 'john@example.com' }
      ]
    };
    const sql = generateSQL(parsed);
    expect(sql).toContain('INSERT INTO customers');
    expect(sql).toContain('(name, email)');
    expect(sql).toContain("('John Doe', 'john@example.com')");
  });

  it('handles unknown commands', () => {
    const result = parseVoiceCommand('this is not a valid command');
    expect(result.action).toBe('unknown');
  });
});
