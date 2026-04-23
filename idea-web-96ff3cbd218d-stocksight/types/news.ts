export interface NewsArticle {
  id: string;
  symbol: string;
  title: string;
  description: string;
  url: string;
  source: {
    id: string | null;
    name: string;
  };
  publishedAt: string;
  sentiment: number;
  sentimentLabel: 'bullish' | 'bearish' | 'neutral';
}
