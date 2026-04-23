import axios from 'axios';
import { getPriceHistory, insertPriceHistory } from '../db';

const API_BASE_URL = 'https://api.lootvault.com/v1';

interface FortniteApiResponse {
  status: number;
  data: {
    item: {
      id: string;
      name: string;
      description: string;
      type: {
        id: string;
        name: string;
      };
      rarity: {
        id: string;
        name: string;
      };
      images: {
        icon: string;
        featured: string;
      };
      shopHistory: Array<{
        regularPrice: number;
        finalPrice: number;
        lastUpdate: string;
      }>;
    };
  };
}

interface GenshinApiResponse {
  id: number;
  name: string;
  rarity: number;
  type: string;
  description: string;
  icon: string;
  price: number;
  lastUpdated: string;
}

interface DestinyApiResponse {
  Response: {
    data: {
      items: Array<{
        itemHash: number;
        itemInstanceId: string;
        quantity: number;
        bindStatus: number;
        location: number;
        bucketHash: number;
        transferStatus: number;
        lockable: boolean;
        state: number;
        dismantlePermission: number;
        isWrapper: boolean;
        tooltipNotificationIndexes: number[];
        metricHash: number;
        metricObjective: {
          objectiveHash: number;
          destinationHash: number;
          activityHash: number;
          visible: boolean;
        };
        versionNumber: number;
        itemValue: {
          itemHash: number;
          quantity: number;
          hasConditionalVisibility: boolean;
        };
      }>;
    };
  };
}

export const fetchItemPrice = async (game: string, itemId: string): Promise<number> => {
  try {
    // Real API calls for Fortnite and Genshin Impact
    if (game === 'fortnite') {
      const response = await axios.get<FortniteApiResponse>(
        `https://fortnite-api.com/v2/shop/${itemId}`
      );

      if (response.data.status === 200 && response.data.data.item.shopHistory.length > 0) {
        const latestPrice = response.data.data.item.shopHistory[0].finalPrice;
        const today = new Date().toISOString().split('T')[0];
        await insertPriceHistory(itemId, latestPrice, today);
        return latestPrice;
      }
    } else if (game === 'genshin') {
      const response = await axios.get<GenshinApiResponse>(
        `https://api.genshin.dev/materials/${itemId}`
      );

      if (response.data.price) {
        const today = new Date().toISOString().split('T')[0];
        await insertPriceHistory(itemId, response.data.price, today);
        return response.data.price;
      }
    } else if (game === 'destiny') {
      // Mock Destiny 2 API response since real API requires OAuth
      const mockPrices: Record<string, number> = {
        'weapon-1': 1250,
        'armor-1': 850,
        'consumable-1': 250,
        'exotic-1': 5000,
      };

      const price = mockPrices[itemId] || 100 + Math.floor(Math.random() * 900);
      const today = new Date().toISOString().split('T')[0];
      await insertPriceHistory(itemId, price, today);
      return price;
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
  // Buy if current price is 10% below average
  return currentPrice < averagePrice * 0.9;
};

interface PriceHistory {
  id: number;
  itemId: string;
  price: number;
  date: string;
}
