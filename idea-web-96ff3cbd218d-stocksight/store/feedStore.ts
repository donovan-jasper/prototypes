import create from 'zustand';
import { fetchNewsForSymbols } from '../services/news';
import { analyzeArticleSentiment, getSentimentLabel } from '../services/sentiment';
import { NewsArticle } from '../types/news';

interface FeedState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchFeed: (symbols: string[]) => Promise<void>;
  dismissArticle: (id: string) => void;
  filterSentiment: (sentiment: 'all' | 'bullish' | 'bearish' | 'neutral') => void;
  filteredArticles: NewsArticle[];
  currentSentimentFilter: 'all' | 'bullish' | 'bearish' | 'neutral';
}

export const useFeedStore = create<FeedState>((set, get) => ({
  articles: [],
  filteredArticles: [],
  isLoading: false,
  error: null,
  currentSentimentFilter: 'all',

  fetchFeed: async (symbols: string[]) => {
    set({ isLoading: true, error: null });

    try {
      // Fetch news for all symbols
      const allArticles = await fetchNewsForSymbols(symbols);

      // Analyze sentiment for each article
      const articlesWithSentiment = await Promise.all(
        allArticles.map(async (article) => {
          const sentimentScore = await analyzeArticleSentiment(article);
          return {
            ...article,
            sentiment: sentimentScore,
            sentimentLabel: getSentimentLabel(sentimentScore),
          };
        })
      );

      set({
        articles: articlesWithSentiment,
        filteredArticles: articlesWithSentiment,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({
        error: 'Failed to load news feed',
        isLoading: false,
      });
    }
  },

  dismissArticle: (id: string) => {
    set((state) => ({
      articles: state.articles.filter(article => article.id !== id),
      filteredArticles: state.filteredArticles.filter(article => article.id !== id),
    }));
  },

  filterSentiment: (sentiment: 'all' | 'bullish' | 'bearish' | 'neutral') => {
    const { articles } = get();

    if (sentiment === 'all') {
      set({
        filteredArticles: articles,
        currentSentimentFilter: sentiment,
      });
    } else {
      set({
        filteredArticles: articles.filter(article => article.sentimentLabel === sentiment),
        currentSentimentFilter: sentiment,
      });
    }
  },
}));
