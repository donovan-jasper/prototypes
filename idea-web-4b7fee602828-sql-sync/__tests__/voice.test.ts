import { parseVoiceCommand } from '../lib/voice';

describe('Voice input', () => {
  test('parses add command', () => {
    const result = parseVoiceCommand('add John Smith john@example.com in progress');
    expect(result.action).toBe('add');
    expect(result.fields).toContain('John Smith');
  });

  test('parses query command', () => {
    const result = parseVoiceCommand('show all clients from last month');
    expect(result.action).toBe('query');
    expect(result.query).toContain('last month');
  });
});
