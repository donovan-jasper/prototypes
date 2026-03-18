import { create } from 'zustand';
import { openDatabase } from '../utils/database';

const db = openDatabase();

interface Stock {
  symbol: string;
  price: number;
  change: number;
}

interface WatchlistStore {
  stocks: Stock[];
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
  updateStockPrice: (symbol: string, price: number, change: number) => void;
  loadFromDB: () => void;
  saveToDB: () => void;
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  stocks: [],
  addStock: (symbol) => {
    const currentStocks = get().stocks;
    
    if (currentStocks.some(stock => stock.symbol === symbol)) {
      return;
    }
    
    set((state) => ({
      stocks: [...state.stocks, { symbol, price: 0, change: 0 }],
    }));
    get().saveToDB();
  },
  removeStock: (symbol) => {
    set((state) => ({
      stocks: state.stocks.filter((stock) => stock.symbol !== symbol),
    }));
    get().saveToDB();
  },
  updateStockPrice: (symbol, price, change) => {
    set((state) => ({
      stocks: state.stocks.map((stock) =>
        stock.symbol === symbol ? { ...stock, price, change } : stock
      ),
    }));
    get().saveToDB();
  },
  loadFromDB: () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM watchlist',
        [],
        (_, { rows }) => {
          const stocks = [];
          for (let i = 0; i < rows.length; i++) {
            stocks.push(rows.item(i));
          }
          set({ stocks });
        },
        (_, error) => {
          console.error('Error loading watchlist:', error);
          return false;
        }
      );
    });
  },
  saveToDB: () => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM watchlist');
      get().stocks.forEach((stock) => {
        tx.executeSql(
          'INSERT INTO watchlist (symbol, price, change) VALUES (?, ?, ?)',
          [stock.symbol, stock.price, stock.change]
        );
      });
    });
  },
}));
