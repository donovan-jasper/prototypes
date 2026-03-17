import axios from 'axios';

const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key
const BASE_URL = 'https://finnhub.io/api/v1';

export const searchStocks = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: query,
        token: API_KEY
      }
    });

    // Transform the response to match our expected format
    return response.data.result.map((item: any) => ({
      symbol: item.symbol,
      name: item.description,
      price: Math.random() * 100 + 50, // Mock price - replace with actual API call
      change: (Math.random() * 10 - 5).toFixed(2) // Mock change - replace with actual API call
    })).slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
};

export const fetchStockData = async (symbol: string) => {
  try {
    // In a real implementation, you would make multiple API calls to get all the data
    // For this example, we'll mock the response

    return {
      symbol,
      name: `Company ${symbol}`,
      price: Math.random() * 100 + 50,
      change: (Math.random() * 10 - 5).toFixed(2),
      description: `This is a detailed description of ${symbol}. The company was founded in 2000 and operates in the technology sector. It has a market capitalization of over $1 trillion and employs thousands of people worldwide.`,
      marketCap: Math.floor(Math.random() * 1000000000000),
      week52High: Math.random() * 200 + 100,
      week52Low: Math.random() * 50 + 20,
      volume: Math.floor(Math.random() * 10000000)
    };
  } catch (error) {
    console.error('Stock data API error:', error);
    throw error;
  }
};

export const fetchStockChartData = async (symbol: string) => {
  try {
    // Mock chart data - in a real app, you would fetch from an API
    const now = new Date();
    const data = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.random() * 100 + 50
      });
    }

    return data;
  } catch (error) {
    console.error('Chart data API error:', error);
    throw error;
  }
};
