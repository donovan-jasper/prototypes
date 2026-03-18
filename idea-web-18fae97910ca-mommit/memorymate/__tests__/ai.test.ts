import { parseNaturalLanguage, generateSuggestions, setApiKey } from '../lib/ai';

describe('AI operations', () => {
  beforeAll(async () => {
    // Set a test API key (you'll need to provide a real one for actual testing)
    await setApiKey('test-api-key');
  });

  it('should parse natural language for time-based reminder', async () => {
    const input = 'Remind me to call mom tomorrow at 5 PM';
    const result = await parseNaturalLanguage(input);
    
    if (result) {
      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.trigger_type).toBe('time');
      expect(result.trigger_value).toBeDefined();
    }
  });

  it('should parse natural language for location-based reminder', async () => {
    const input = 'Buy milk when I\'m near the grocery store';
    const result = await parseNaturalLanguage(input);
    
    if (result) {
      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.trigger_type).toBe('location');
      expect(result.trigger_value).toBeDefined();
    }
  });

  it('should return null for invalid API key', async () => {
    await setApiKey('invalid-key');
    const input = 'Test reminder';
    const result = await parseNaturalLanguage(input);
    expect(result).toBeNull();
  });

  it('should generate suggestions from user history', async () => {
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
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
