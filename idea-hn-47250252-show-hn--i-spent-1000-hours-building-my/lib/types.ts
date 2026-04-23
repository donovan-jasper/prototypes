export interface Transaction {
  id?: number;
  amount: number;
  category: string;
  date: string; // ISO string
  type: 'income' | 'expense';
  note?: string;
  receiptPhoto?: string;
  currency?: string; // Added for multi-currency support
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
  currency?: string; // Added for multi-currency support
}

export interface Asset {
  id?: number;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property' | 'other';
  currency?: string; // Added for multi-currency support
}

export interface Liability {
  id?: number;
  name: string;
  value: number;
  type: 'loan' | 'credit-card' | 'mortgage' | 'other';
  currency?: string; // Added for multi-currency support
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
  currency?: string; // Added for multi-currency support
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency?: string; // Added for multi-currency support
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
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
}
