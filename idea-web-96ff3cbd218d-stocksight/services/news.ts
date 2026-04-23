import axios from 'axios';
import { NewsArticle } from '../types/news';
import { NEWS_API_KEY } from '../constants/config';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export const fetchNewsForSymbol = async (symbol: string): Promise<NewsArticle[]> => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: symbol,
        apiKey: NEWS_API_KEY,
        sortBy: 'publishedAt',
        pageSize: 20,
        language: 'en',
      },
    });

    return response.data.articles.map((article: any, index: number) => ({
      id: `${symbol}-${index}`,
      symbol,
      title: article.title,
      description: article.description || '',
      url: article.url,
      source: {
        id: article.source.id || '',
        name: article.source.name || 'Unknown',
      },
      publishedAt: article.publishedAt,
      sentiment: 0, // Will be calculated by sentiment service
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
