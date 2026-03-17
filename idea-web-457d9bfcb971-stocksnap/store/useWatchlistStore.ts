import { create } from 'zustand';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../lib/database';

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

interface WatchlistState {
  stocks: Stock[];
  addStock: (stock: Stock) => Promise<void>;
  removeStock: (symbol: string) => Promise<void>;
  loadWatchlist: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  stocks: [],
  addStock: async (stock) => {
    try {
      await addToWatchlist(stock.symbol, stock.name);
      set((state) => ({
        stocks: [...state.stocks, stock]
      }));
    } catch (error) {
      console.error('Failed to add stock to watchlist:', error);
    }
  },
  removeStock: async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      set((state) => ({
        stocks: state.stocks.filter(stock => stock.symbol !== symbol)
      }));
    } catch (error) {
      console.error('Failed to remove stock from watchlist:', error);
    }
  },
  loadWatchlist: async () => {
    try {
      const watchlist = await getWatchlist();
      set({
        stocks: watchlist.map(item => ({
          symbol: item.symbol,
          name: item.name,
          price: 0 // Price would need to be fetched separately
        }))
      });
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  },
}));
