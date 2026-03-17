import { PriceService } from '../lib/priceService';

// Mock Date.now for consistent cache testing
const MOCK_DATE_NOW = 1678886400000; // March 15, 2023 12:00:00 PM UTC

describe('PriceService', () => {
  let priceServiceFree: PriceService;
  let priceServicePremium: PriceService;
  let mockFetchApi: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE_NOW); // Set a fixed time for testing cache
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // Mock console.warn

    // Create a mock fetch function to control API responses for testing
    mockFetchApi = jest.fn(async (symbol: string) => {
      const prices = {
        AAPL: 180.00,
        BTC: 65000.00,
        ETH: 3500.00,
        // Add some variability to simulate different prices on subsequent fetches
        GME: 25.00 + Math.random() * 0.1,
        DOGE: 0.15 + Math.random() * 0.001,
      };
      if (prices[symbol] !== undefined) {
        return prices[symbol];
      }
      throw new Error(`Asset not found: ${symbol}`);
    });

    // Instantiate PriceService with mockFetchApi
    priceServiceFree = new PriceService(false, mockFetchApi);
    priceServicePremium = new PriceService(true, mockFetchApi);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (console.error as jest.Mock).mockRestore(); // Restore original console.error
    (console.warn as jest.Mock).mockRestore(); // Restore original console.warn
  });

  test('returns price for known symbol (free tier)', async () => {
    const price = await priceServiceFree.getPrice('AAPL');
    expect(price).toBeGreaterThan(0);
    expect(mockFetchApi).toHaveBeenCalledWith('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);
  });

  test('returns price for known symbol (premium tier)', async () => {
    const price = await priceServicePremium.getPrice('BTC');
    expect(price).toBeGreaterThan(0);
    expect(mockFetchApi).toHaveBeenCalledWith('BTC');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);
  });

  test('throws error for unknown symbol', async () => {
    await expect(priceServiceFree.getPrice('INVALID')).rejects.toThrow('Asset not found: INVALID');
    expect(mockFetchApi).toHaveBeenCalledWith('INVALID');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);
  });

  test('caches prices for free tier and returns cached value within duration', async () => {
    const initialPrice = await priceServiceFree.getPrice('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1 * 60 * 60 * 1000); // Advance 1 hour (less than 24h cache duration)
    const cachedPrice = await priceServiceFree.getPrice('AAPL');
    expect(cachedPrice).toBe(initialPrice); // Should return the same cached price
    expect(mockFetchApi).toHaveBeenCalledTimes(1); // Should NOT call API again
  });

  test('fetches new price for free tier after cache expires', async () => {
    const initialPrice = await priceServiceFree.getPrice('GME'); // Use GME for variability
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 1); // Advance > 24 hours (cache expires)
    const newPrice = await priceServiceFree.getPrice('GME');
    expect(newPrice).not.toBe(initialPrice); // Should fetch a new, potentially different price
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Should call API again
  });

  test('caches prices for premium tier and returns cached value within duration', async () => {
    const initialPrice = await priceServicePremium.getPrice('BTC');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1 * 60 * 1000); // Advance 1 minute (less than 5 min cache duration)
    const cachedPrice = await priceServicePremium.getPrice('BTC');
    expect(cachedPrice).toBe(initialPrice); // Should return the same cached price
    expect(mockFetchApi).toHaveBeenCalledTimes(1); // Should NOT call API again
  });

  test('fetches new price for premium tier after cache expires', async () => {
    const initialPrice = await priceServicePremium.getPrice('DOGE'); // Use DOGE for variability
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5 * 60 * 1000 + 1); // Advance > 5 minutes (cache expires)
    const newPrice = await priceServicePremium.getPrice('DOGE');
    expect(newPrice).not.toBe(initialPrice); // Should fetch a new, potentially different price
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Should call API again
  });

  test('clears cache for a specific symbol', async () => {
    await priceServiceFree.getPrice('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    priceServiceFree.clearCache('AAPL');
    jest.advanceTimersByTime(100); // Small advance to ensure time passes
    await priceServiceFree.getPrice('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Should fetch new price after clearing
  });

  test('clears all cache', async () => {
    await priceServiceFree.getPrice('AAPL');
    await priceServiceFree.getPrice('BTC');
    expect(mockFetchApi).toHaveBeenCalledTimes(2);

    priceServiceFree.clearCache();
    jest.advanceTimersByTime(100);
    await priceServiceFree.getPrice('AAPL');
    await priceServiceFree.getPrice('BTC');
    expect(mockFetchApi).toHaveBeenCalledTimes(4); // Should fetch new prices after clearing all
  });

  test('setPremiumStatus clears cache and updates tier', async () => {
    await priceServiceFree.getPrice('AAPL'); // Fetch as free tier
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1 * 60 * 1000); // Advance 1 minute (within free tier cache)
    priceServiceFree.setPremiumStatus(true); // Change to premium, cache should clear

    await priceServiceFree.getPrice('AAPL'); // Fetch as premium tier (should trigger new fetch due to cleared cache)
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Should fetch new price because cache was cleared

    jest.advanceTimersByTime(1 * 60 * 1000); // Advance 1 minute (within premium 5 min cache)
    await priceServiceFree.getPrice('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Should be cached now for premium tier
  });

  test('returns expired cached price if external fetch fails', async () => {
    // First, fetch a price and cache it
    const initialPrice = await priceServiceFree.getPrice('AAPL');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 1); // Expire cache

    // Make mockFetchApi fail for 'AAPL' on next call
    mockFetchApi.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const price = await priceServiceFree.getPrice('AAPL');
    expect(price).toBe(initialPrice); // Should return the expired cached price
    expect(mockFetchApi).toHaveBeenCalledTimes(2); // Still called the API, but it failed
    expect(console.error).toHaveBeenCalledWith(
      '[PriceService] Failed to fetch price for AAPL:',
      expect.any(Error)
    );
    expect(console.warn).toHaveBeenCalledWith(
      '[PriceService] Returning expired cached price for AAPL due to fetch error.'
    );
  });
});
