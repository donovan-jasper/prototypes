import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock } from '../types/stock';
import { initializeDatabase, addStockToDB, removeStockFromDB, getWatchlistFromDB } from '../utils/database';

interface WatchlistState {
  stocks: Stock[];
  isPremium: boolean;
  maxStocks: number;
  initialize: () => Promise<void>;
  addStock: (symbol: string, name: string) => Promise<void>;
  removeStock: (symbol: string) => Promise<void>;
  setPremiumStatus: (isPremium: boolean) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      stocks: [],
      isPremium: false,
      maxStocks: 5,

      initialize: async () => {
        await initializeDatabase();
        const savedStocks = await getWatchlistFromDB();
        set({ stocks: savedStocks });
      },

      addStock: async (symbol: string, name: string) => {
        const { stocks, isPremium, maxStocks } = get();

        if (!isPremium && stocks.length >= maxStocks) {
          throw new Error('Free tier limit reached. Upgrade to add more stocks.');
        }

        if (stocks.some(stock => stock.symbol === symbol)) {
          throw new Error('Stock already in watchlist');
        }

        const newStock: Stock = {
          symbol,
          name,
          addedAt: new Date().toISOString(),
        };

        await addStockToDB(newStock);
        set({ stocks: [...stocks, newStock] });
      },

      removeStock: async (symbol: string) => {
        const { stocks } = get();
        const updatedStocks = stocks.filter(stock => stock.symbol !== symbol);

        await removeStockFromDB(symbol);
        set({ stocks: updatedStocks });
      },

      setPremiumStatus: (isPremium: boolean) => {
        set({
          isPremium,
          maxStocks: isPremium ? 50 : 5,
        });
      },
    }),
    {
      name: 'watchlist-storage',
      partialize: (state) => ({
        stocks: state.stocks,
        isPremium: state.isPremium,
      }),
    }
  )
);
