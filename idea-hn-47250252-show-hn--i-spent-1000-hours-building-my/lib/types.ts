export interface Transaction {
  id?: number;
  amount: number;
  category: string;
  date: string; // ISO string
  type: 'income' | 'expense';
  note?: string;
  receiptPhoto?: string;
}

export interface Holding {
  id?: number;
  symbol: string;
  shares: number;
  costBasis: number; // Price per share when purchased
  assetType: 'stock' | 'crypto' | 'real-estate' | 'other';
  currentPrice?: number; // Will be fetched from API
  currentValue?: number; // shares * currentPrice
  gain?: number; // currentValue - (shares * costBasis)
  percentGain?: number; // (gain / (shares * costBasis)) * 100
}

export interface Asset {
  id?: number;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property' | 'other';
}

export interface Liability {
  id?: number;
  name: string;
  value: number;
  type: 'loan' | 'credit-card' | 'mortgage' | 'other';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalPercentGain: number;
  holdings: Holding[];
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface CachedPrice {
  price: number;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface PriceService {
  getPrice(symbol: string): Promise<number>;
  startPeriodicUpdates(intervalMs: number, callback: () => void): void;
  stopPeriodicUpdates(): void;
  clearCache(): void;
  getLastUpdateTime(symbol: string): number | null;
}
