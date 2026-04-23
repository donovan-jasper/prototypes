import axios from 'axios';

const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key from Finnhub
const BASE_URL = 'https://finnhub.io/api/v1';

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  description: string;
  marketCap: number;
  week52High: number;
  week52Low: number;
  volume: number;
}

interface ChartDataPoint {
  date: string;
  price: number;
}

export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    // First search for symbols
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: query,
        token: API_KEY
      }
    });

    // Get detailed info for each symbol
    const detailedResults = await Promise.all(
      searchResponse.data.result.slice(0, 10).map(async (item: any) => {
        try {
          // Get quote data
          const quoteResponse = await axios.get(`${BASE_URL}/quote`, {
            params: {
              symbol: item.symbol,
              token: API_KEY
            }
          });

          // Get company profile
          const profileResponse = await axios.get(`${BASE_URL}/stock/profile2`, {
            params: {
              symbol: item.symbol,
              token: API_KEY
            }
          });

          return {
            symbol: item.symbol,
            name: profileResponse.data.name || item.description,
            price: quoteResponse.data.c || 0,
            change: quoteResponse.data.dp || 0
          };
        } catch (error) {
          console.error(`Error fetching details for ${item.symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed requests and return
    return detailedResults.filter(Boolean) as StockSearchResult[];
  } catch (error) {
    console.error('Search API error:', error);
    throw new Error('Failed to fetch search results. Please try again later.');
  }
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Get quote data
    const quoteResponse = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });

    // Get company profile
    const profileResponse = await axios.get(`${BASE_URL}/stock/profile2`, {
      params: {
        symbol,
        token: API_KEY
      }
    });

    // Get company metrics
    const metricsResponse = await axios.get(`${BASE_URL}/stock/metric`, {
      params: {
        symbol,
        metric: 'all',
        token: API_KEY
      }
    });

    return {
      symbol,
      name: profileResponse.data.name || `Company ${symbol}`,
      price: quoteResponse.data.c || 0,
      change: quoteResponse.data.dp || 0,
      description: profileResponse.data.finnhubIndustry || 'No description available',
      marketCap: metricsResponse.data.metric.marketCapitalization || 0,
      week52High: metricsResponse.data.metric['52WeekHigh'] || 0,
      week52Low: metricsResponse.data.metric['52WeekLow'] || 0,
      volume: quoteResponse.data.v || 0
    };
  } catch (error) {
    console.error('Stock data API error:', error);
    throw new Error('Failed to fetch stock data. Please try again later.');
  }
};

export const fetchStockChartData = async (symbol: string, resolution: string = 'D'): Promise<ChartDataPoint[]> => {
  try {
    // Get current timestamp
    const to = Math.floor(Date.now() / 1000);
    // Get timestamp from 30 days ago
    const from = to - (30 * 24 * 60 * 60);

    const response = await axios.get(`${BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to,
        token: API_KEY
      }
    });

    if (!response.data.t || response.data.t.length === 0) {
      throw new Error('No chart data available');
    }

    // Transform the data to our format
    return response.data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      price: response.data.c[index]
    }));
  } catch (error) {
    console.error('Chart data API error:', error);
    throw new Error('Failed to fetch chart data. Please try again later.');
  }
};
