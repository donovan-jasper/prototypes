import axios from 'axios';
import { NewsArticle } from '../types/news';
import { HUGGING_FACE_API_KEY } from '../constants/config';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';

interface SentimentResponse {
  label: string;
  score: number;
}

export const analyzeSentimentWithAPI = async (text: string): Promise<number> => {
  try {
    const response = await axios.post<SentimentResponse[]>(
      HUGGING_FACE_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
      }
    );

    // The API returns both positive and negative scores, we'll use the difference
    const positiveScore = response.data.find(item => item.label === 'POSITIVE')?.score || 0;
    const negativeScore = response.data.find(item => item.label === 'NEGATIVE')?.score || 0;

    // Calculate sentiment score between -1 and 1
    return positiveScore - negativeScore;
  } catch (error) {
    console.error('Error analyzing sentiment with API:', error);
    // Fallback to local analysis if API fails
    return analyzeSentimentLocally(text);
  }
};

const analyzeSentimentLocally = (text: string): number => {
  const positiveWords = [
    'rise', 'up', 'gain', 'profit', 'bullish', 'strong', 'positive',
    'surge', 'boom', 'growth', 'increase', 'success', 'improve',
    'expand', 'recover', 'stronger', 'better', 'higher', 'win',
    'advantage', 'opportunity', 'bull', 'bulls', 'optimistic',
    'prosper', 'prosperity', 'profitability', 'profitably', 'profitmaking'
  ];

  const negativeWords = [
    'bearish', 'bears', 'fall', 'down', 'loss', 'decline', 'weak',
    'negative', 'plunge', 'crash', 'decrease', 'fail', 'worse',
    'lower', 'lose', 'disadvantage', 'risk', 'danger', 'pessimistic',
    'unprofitable', 'losses', 'loss-making', 'lossy'
  ];

  const normalizedText = text.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (normalizedText.includes(word)) {
      score += 0.5;
    }
  });

  negativeWords.forEach(word => {
    if (normalizedText.includes(word)) {
      score -= 0.5;
    }
  });

  // Normalize score to range [-1, 1]
  return Math.max(-1, Math.min(1, score));
};

export const analyzeArticleSentiment = async (article: NewsArticle): Promise<number> => {
  // Combine headline and description for more context
  const textToAnalyze = `${article.title} ${article.description || ''}`;
  return await analyzeSentimentWithAPI(textToAnalyze);
};

export const getSentimentLabel = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score > 0.3) return 'bullish';
  if (score < -0.3) return 'bearish';
  return 'neutral';
};
