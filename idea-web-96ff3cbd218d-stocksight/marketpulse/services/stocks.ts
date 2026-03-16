import api from './api';
import { openDatabase } from '../utils/database';

const db = openDatabase();

export const fetchStockPrice = async (symbol: string) => {
  try {
    const response = await api.get(`/stocks/${symbol}/price`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

export const fetchStockDetails = async (symbol: string) => {
  try {
    const response = await api.get(`/stocks/${symbol}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock details:', error);
    throw error;
  }
};

export const cacheStockPrice = (symbol: string, price: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT OR REPLACE INTO cached_prices (symbol, price, timestamp) VALUES (?, ?, datetime("now"))',
      [symbol, price]
    );
  });
};

export const getCachedStockPrice = (symbol: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT price FROM cached_prices WHERE symbol = ? AND timestamp > datetime("now", "-5 minutes")',
        [symbol],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0).price);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
