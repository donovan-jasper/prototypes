import { NewsArticle } from '../types/news';

interface SentimentWord {
  word: string;
  score: number;
  context?: {
    positive?: string[];
    negative?: string[];
  };
}

const sentimentWords: SentimentWord[] = [
  // Positive words
  { word: 'rise', score: 0.8 },
  { word: 'up', score: 0.7, context: { positive: ['rise', 'increase', 'grow'] } },
  { word: 'gain', score: 0.8 },
  { word: 'profit', score: 0.9 },
  { word: 'bullish', score: 0.9 },
  { word: 'strong', score: 0.7 },
  { word: 'positive', score: 0.8 },
  { word: 'surge', score: 0.9 },
  { word: 'boom', score: 0.9 },
  { word: 'growth', score: 0.8 },
  { word: 'increase', score: 0.8 },
  { word: 'success', score: 0.9 },
  { word: 'improve', score: 0.8 },
  { word: 'expand', score: 0.7 },
  { word: 'recover', score: 0.8 },
  { word: 'stronger', score: 0.8 },
  { word: 'better', score: 0.8 },
  { word: 'higher', score: 0.7 },
  { word: 'win', score: 0.8 },
  { word: 'advantage', score: 0.7 },
  { word: 'opportunity', score: 0.8 },
  { word: 'bull', score: 0.9 },
  { word: 'bulls', score: 0.9 },
  { word: 'optimistic', score: 0.8 },
  { word: 'prosper', score: 0.9 },
  { word: 'prosperity', score: 0.9 },
  { word: 'profitability', score: 0.9 },
  { word: 'profitably', score: 0.9 },
  { word: 'profitmaking', score: 0.9 },

  // Negative words
  { word: 'bearish', score: -0.9 },
  { word: 'bears', score: -0.9 },
  { word: 'fall', score: -0.8 },
  { word: 'down', score: -0.7, context: { negative: ['fall', 'decline', 'drop'] } },
  { word: 'loss', score: -0.9 },
  { word: 'decline', score: -0.8 },
  { word: 'weak', score: -0.7 },
  { word: 'negative', score: -0.8 },
  { word: 'plunge', score: -0.9 },
  { word: 'crash', score: -0.9 },
  { word: 'decrease', score: -0.8 },
  { word: 'fail', score: -0.9 },
  { word: 'worse', score: -0.8 },
  { word: 'lower', score: -0.7 },
  { word: 'lose', score: -0.8 },
  { word: 'disadvantage', score: -0.7 },
  { word: 'risk', score: -0.7 },
  { word: 'danger', score: -0.8 },
  { word: 'pessimistic', score: -0.8 },
  { word: 'unprofitable', score: -0.9 },
  { word: 'losses', score: -0.9 },
  { word: 'loss-making', score: -0.9 },
  { word: 'lossy', score: -0.9 },

  // Neutral words (for context)
  { word: 'stable', score: 0 },
  { word: 'steady', score: 0 },
  { word: 'flat', score: 0 },
  { word: 'neutral', score: 0 },
  { word: 'mixed', score: 0 },
  { word: 'uncertain', score: 0 },
  { word: 'volatile', score: 0 },
];

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ');   // Normalize whitespace
};

const analyzeSentiment = (headline: string): number => {
  const normalized = normalizeText(headline);
  const words = normalized.split(' ');
  let score = 0;
  let wordCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const sentimentWord = sentimentWords.find(sw => sw.word === word);

    if (sentimentWord) {
      // Check for context modifiers
      let contextScore = sentimentWord.score;

      if (sentimentWord.context) {
        // Check previous words for positive context
        if (sentimentWord.context.positive) {
          for (let j = Math.max(0, i - 3); j < i; j++) {
            if (sentimentWord.context.positive.includes(words[j])) {
              contextScore = Math.min(1, contextScore * 1.2); // Increase score by 20%
              break;
            }
          }
        }

        // Check previous words for negative context
        if (sentimentWord.context.negative) {
          for (let j = Math.max(0, i - 3); j < i; j++) {
            if (sentimentWord.context.negative.includes(words[j])) {
              contextScore = Math.max(-1, contextScore * 1.2); // Increase magnitude by 20%
              break;
            }
          }
        }
      }

      score += contextScore;
      wordCount++;
    }
  }

  // Avoid division by zero
  if (wordCount === 0) return 0;

  // Normalize score to range [-1, 1]
  const averageScore = score / wordCount;
  return Math.max(-1, Math.min(1, averageScore));
};

export const analyzeArticleSentiment = (article: NewsArticle): number => {
  // Combine headline and description for more context
  const textToAnalyze = `${article.title} ${article.description || ''}`;
  return analyzeSentiment(textToAnalyze);
};

export const getSentimentLabel = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score > 0.3) return 'bullish';
  if (score < -0.3) return 'bearish';
  return 'neutral';
};
