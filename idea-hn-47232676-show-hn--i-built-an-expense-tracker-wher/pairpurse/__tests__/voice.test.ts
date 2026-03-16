import { parseVoiceInput } from '../lib/voice';

describe('Voice Input Parsing', () => {
  test('parses simple expense command', () => {
    const result = parseVoiceInput('Coffee 4 dollars 50 split evenly');

    expect(result.description).toBe('Coffee');
    expect(result.amount).toBe(4.5);
    expect(result.splitType).toBe('even');
  });

  test('handles various currency formats', () => {
    expect(parseVoiceInput('Lunch $12.50').amount).toBe(12.5);
    expect(parseVoiceInput('Taxi 15 dollars').amount).toBe(15);
    expect(parseVoiceInput('Snack 3.25').amount).toBe(3.25);
  });

  test('extracts category from context', () => {
    expect(parseVoiceInput('Uber to airport 25 dollars').category).toBe('Transport');
    expect(parseVoiceInput('Dinner at restaurant 60').category).toBe('Food');
  });
});
