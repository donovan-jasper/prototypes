export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  id: string;
  symbol: string;
  title: string;
  description: string;
  url: string;
  source: NewsSource;
  publishedAt: string;
  sentiment: number;
  sentimentLabel?: 'bullish' | 'bearish' | 'neutral';
}
