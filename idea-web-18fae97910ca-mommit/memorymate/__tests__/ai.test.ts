import { parseNaturalLanguage, generateSuggestions } from '../lib/ai';

describe('AI operations', () => {
  it('should parse natural language', async () => {
    const input = 'Remind me to call mom tomorrow at 5 PM';
    const result = await parseNaturalLanguage(input);
    expect(result).toBeDefined();
    expect(result.title).toBe('Call mom');
    expect(result.trigger_type).toBe('time');
  });

  it('should generate suggestions', async () => {
    const userHistory = [
      {
        title: 'Call mom',
        description: 'Remind me to call mom',
        trigger_type: 'time',
        trigger_value: new Date().toISOString(),
        completed: false,
      },
    ];
    const suggestions = await generateSuggestions(userHistory);
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
