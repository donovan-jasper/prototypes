export interface Transaction {
  id: number;
  amount: number;
  category: string;
  note: string;
  type: 'expense' | 'income';
  date: string;
}

export interface Holding {
  id: number;
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice: number; // This will be updated by PriceService
  assetType: 'stock' | 'crypto' | 'real estate' | 'other';
}

export interface Asset {
  id: number;
  value: number;
  type: string;
}

export interface Liability {
  id: number;
  value: number;
  type: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

// New interface for cached prices
export interface CachedPrice {
  price: number;
  timestamp: number; // Unix timestamp in milliseconds
}
