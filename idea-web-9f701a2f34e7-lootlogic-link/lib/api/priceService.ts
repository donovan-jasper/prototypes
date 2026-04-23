import axios from 'axios';
import { getPriceHistory, insertPriceHistory } from '../db';

const API_BASE_URL = 'https://api.lootvault.com/v1';

export const fetchItemPrice = async (game: string, itemId: string): Promise<number> => {
  try {
    // In a real app, this would call a real API
    // For now, we'll simulate with random data

    // Get historical data to base the new price on
    const history = await getPriceHistory(itemId);

    // If we have history, use the last price as a base
    let basePrice = 100; // Default base price
    if (history.length > 0) {
      basePrice = history[0].price;
    }

    // Generate a random price that's ±20% of the base price
    const randomVariation = 0.8 + Math.random() * 0.4; // Range: 0.8 to 1.2
    const newPrice = basePrice * randomVariation;

    // Round to 2 decimal places
    const roundedPrice = Math.round(newPrice * 100) / 100;

    // Save to price history
    const today = new Date().toISOString().split('T')[0];
    await insertPriceHistory(itemId, roundedPrice, today);

    return roundedPrice;
  } catch (error) {
    console.error('Error fetching item price:', error);
    throw error;
  }
};

export const getPriceHistory = async (itemId: string): Promise<PriceHistory[]> => {
  try {
    // In a real app, this would call a real API
    // For now, we'll simulate with random data

    // Get from database first
    const dbHistory = await getPriceHistory(itemId);

    if (dbHistory.length > 0) {
      return dbHistory;
    }

    // If no history in DB, generate some mock data
    const mockHistory: PriceHistory[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Generate a random price that trends slightly over time
      const basePrice = 100 + (i * 0.5);
      const randomVariation = 0.9 + Math.random() * 0.2;
      const price = basePrice * randomVariation;

      mockHistory.push({
        id: i,
        itemId,
        price: Math.round(price * 100) / 100,
        date: date.toISOString().split('T')[0]
      });
    }

    // Save mock data to DB
    for (const entry of mockHistory) {
      await insertPriceHistory(itemId, entry.price, entry.date);
    }

    return mockHistory;
  } catch (error) {
    console.error('Error getting price history:', error);
    throw error;
  }
};

export const shouldBuyNow = (currentPrice: number, averagePrice: number): boolean => {
  // Recommend buying if current price is 10% below average
  return currentPrice < averagePrice * 0.9;
};

interface PriceHistory {
  id: number;
  itemId: string;
  price: number;
  date: string;
}
