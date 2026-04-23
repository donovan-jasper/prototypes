export interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string; // ISO string
  type: 'income' | 'expense';
  note?: string;
  receiptUri?: string;
}

export interface Holding {
  id: number;
  symbol: string;
  shares: number;
  costBasis: number;
  purchaseDate: string; // ISO string
  currentPrice?: number;
  gain?: number;
  percentGain?: number;
  currentValue?: number;
}

export interface Asset {
  id: number;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'real_estate' | 'other';
}

export interface Liability {
  id: number;
  name: string;
  value: number;
  type: 'loan' | 'mortgage' | 'credit_card' | 'other';
}

export interface Category {
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
  timestamp: number;
}
