import axios from 'axios';
import { getPriceHistory, insertPriceHistory } from '../db';

const API_BASE_URL = 'https://api.lootvault.com/v1';

interface GameApiResponse {
  data: {
    price: number;
    lastUpdated: string;
  };
}

export const fetchItemPrice = async (game: string, itemId: string): Promise<number> => {
  try {
    // Real API calls for Fortnite and Genshin Impact
    if (game === 'fortnite') {
      const response = await axios.get<GameApiResponse>(
        `https://fortnite-api.com/v2/shop/${itemId}`
      );
      return response.data.data.price;
    } else if (game === 'genshin') {
      const response = await axios.get<GameApiResponse>(
        `https://api.genshin.dev/materials/${itemId}`
      );
      return response.data.data.price;
    }

    // Fallback to mock data for other games
    const history = await getPriceHistory(itemId);
    let basePrice = 100;
    if (history.length > 0) {
      basePrice = history[0].price;
    }

    const randomVariation = 0.8 + Math.random() * 0.4;
    const newPrice = basePrice * randomVariation;
    const roundedPrice = Math.round(newPrice * 100) / 100;

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
    const dbHistory = await getPriceHistory(itemId);

    if (dbHistory.length > 0) {
      return dbHistory;
    }

    // Generate mock data if no history exists
    const mockHistory: PriceHistory[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

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
  return currentPrice < averagePrice * 0.9;
};

interface PriceHistory {
  id: number;
  itemId: string;
  price: number;
  date: string;
}
