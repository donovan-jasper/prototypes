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

interface DigestHighlight {
  id: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral';
  audioUrl?: string;
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

export const fetchDailyDigest = async (): Promise<DigestHighlight[]> => {
  try {
    // In a production app, this would call your backend API that processes market data
    // For this prototype, we'll return mock data with some real market insights

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get some market data to base our digest on
    const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    const randomTechStock = techStocks[Math.floor(Math.random() * techStocks.length)];

    const techStockData = await fetchStockData(randomTechStock);

    // Create a realistic digest with some market insights
    return [
      {
        id: '1',
        title: 'Tech Stocks Mixed',
        explanation: `Technology stocks showed mixed performance today. ${techStockData.name} (${techStockData.symbol}) is ${techStockData.change > 0 ? 'up' : 'down'} ${Math.abs(techStockData.change).toFixed(2)}% at $${techStockData.price.toFixed(2)}. The sector is reacting to mixed earnings reports and concerns about inflation.`,
        impact: techStockData.change > 0 ? 'positive' : techStockData.change < 0 ? 'negative' : 'neutral',
        audioUrl: 'https://example.com/audio/tech-stocks.mp3'
      },
      {
        id: '2',
        title: 'Interest Rates Stable',
        explanation: 'The Federal Reserve kept interest rates unchanged today, maintaining a cautious stance on inflation. This stability is supporting riskier assets like stocks and bonds.',
        impact: 'neutral',
        audioUrl: 'https://example.com/audio/interest-rates.mp3'
      },
      {
        id: '3',
        title: 'Consumer Spending Up',
        explanation: 'Retail sales data showed stronger-than-expected growth in April, indicating continued consumer confidence. This bodes well for companies in the retail and service sectors.',
        impact: 'positive',
        audioUrl: 'https://example.com/audio/consumer-spending.mp3'
      }
    ];
  } catch (error) {
    console.error('Daily digest API error:', error);
    // Return fallback data if API fails
    return [
      {
        id: '1',
        title: 'Market Update',
        explanation: 'The stock market showed mixed performance today. Tech stocks led the way higher, while energy companies declined. Investors are watching for further guidance from the Federal Reserve.',
        impact: 'neutral'
      },
      {
        id: '2',
        title: 'Earnings Season',
        explanation: 'Many major companies are reporting earnings this week. Analysts are expecting mixed results across sectors.',
        impact: 'neutral'
      },
      {
        id: '3',
        title: 'Global Trends',
        explanation: 'Geopolitical tensions in Europe are keeping investors on edge. The dollar remains strong against most currencies.',
        impact: 'neutral'
      }
    ];
  }
};
