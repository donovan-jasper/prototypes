import create from 'zustand';
import { fetchNewsForSymbol } from '../services/news';
import { analyzeArticleSentiment } from '../services/sentiment';
import { NewsArticle } from '../types/news';

interface FeedState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchFeed: (symbols: string[]) => Promise<void>;
  dismissArticle: (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchFeed: async (symbols: string[]) => {
    set({ isLoading: true, error: null });

    try {
      // Fetch news for all symbols in parallel
      const newsPromises = symbols.map(symbol => fetchNewsForSymbol(symbol));
      const newsResults = await Promise.all(newsPromises);

      // Flatten all articles and analyze sentiment
      const allArticles = newsResults.flat();
      const articlesWithSentiment = allArticles.map(article => ({
        ...article,
        sentiment: analyzeArticleSentiment(article)
      }));

      // Sort by published date (newest first)
      articlesWithSentiment.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      set({ articles: articlesWithSentiment, isLoading: false });
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({
        error: 'Failed to load news feed',
        isLoading: false
      });
    }
  },

  dismissArticle: (id: string) => {
    set((state) => ({
      articles: state.articles.filter(article => article.id !== id)
    }));
  },
}));
