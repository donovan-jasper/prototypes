import create from 'zustand';

interface Article {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  sentiment: number;
}

interface FeedStore {
  articles: Article[];
  fetchFeed: () => void;
  dismissArticle: (id: string) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  articles: [],
  fetchFeed: () => {
    // Fetch articles from API
    const articles = [
      {
        id: '1',
        title: 'Stock Market Rises',
        source: 'Financial Times',
        timestamp: '2 hours ago',
        sentiment: 0.8,
      },
      {
        id: '2',
        title: 'Stock Market Falls',
        source: 'Wall Street Journal',
        timestamp: '1 hour ago',
        sentiment: -0.7,
      },
    ];
    set({ articles });
  },
  dismissArticle: (id) => {
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
    }));
  },
}));
