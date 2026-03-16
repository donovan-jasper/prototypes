// Mock price service for MVP
// Replace with real API (Alpha Vantage, CoinGecko) in production

const mockPrices = {
  AAPL: 180,
  BTC: 65000,
  ETH: 3500,
  TSLA: 800,
  AMZN: 3500,
  GOOGL: 2800,
  MSFT: 350,
  FB: 350,
  NVDA: 250,
  PYPL: 250,
};

export const fetchAssetPrice = async (symbol: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockPrices[symbol]) {
        resolve(mockPrices[symbol]);
      } else {
        reject(new Error('Asset not found'));
      }
    }, 500);
  });
};
