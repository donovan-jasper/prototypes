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
    throw new Error('Failed to fetch news articles');
  }
};

export const fetchNewsForSymbols = async (symbols: string[]): Promise<NewsArticle[]> => {
  try {
    // Fetch news for all symbols in parallel
    const newsPromises = symbols.map(symbol => fetchNewsForSymbol(symbol));
    const newsResults = await Promise.all(newsPromises);

    // Flatten all articles
    const allArticles = newsResults.flat();

    // Sort by published date (newest first)
    allArticles.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return allArticles;
  } catch (error) {
    console.error('Error fetching news for symbols:', error);
    throw new Error('Failed to fetch news for symbols');
  }
};
