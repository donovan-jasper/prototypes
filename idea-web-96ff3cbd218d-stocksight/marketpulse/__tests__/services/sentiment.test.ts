import { analyzeSentiment } from '../../services/sentiment';

describe('Sentiment Analysis', () => {
  it('should analyze sentiment of a bullish headline', () => {
    const score = analyzeSentiment('Stock Market Rises');
    expect(score).toBeGreaterThan(0);
  });

  it('should analyze sentiment of a bearish headline', () => {
    const score = analyzeSentiment('Stock Market Falls');
    expect(score).toBeLessThan(0);
  });

  it('should analyze sentiment of a neutral headline', () => {
    const score = analyzeSentiment('Stock Market Stable');
    expect(score).toBe(0);
  });
});
