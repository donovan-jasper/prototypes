import { NewsArticle } from '../types/news';

const positiveWords = ['rise', 'up', 'gain', 'profit', 'bullish', 'strong', 'positive', 'surge', 'boom', 'growth'];
const negativeWords = ['fall', 'down', 'loss', 'drop', 'bearish', 'weak', 'negative', 'decline', 'plunge', 'crash'];

export const analyzeSentiment = async (headline: string): Promise<number> => {
  // Simple keyword-based sentiment analysis
  const lowerHeadline = headline.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (lowerHeadline.includes(word)) score += 0.5;
  });

  negativeWords.forEach(word => {
    if (lowerHeadline.includes(word)) score -= 0.5;
  });

  // Normalize score between -1 and 1
  return Math.max(-1, Math.min(1, score));
};
