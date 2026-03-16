import { fetchStockPrice, fetchStockDetails, cacheStockPrice, getCachedStockPrice } from '../../services/stocks';

describe('Stock Service', () => {
  it('should fetch stock price', async () => {
    const price = await fetchStockPrice('AAPL');
    expect(price).toBeDefined();
  });

  it('should fetch stock details', async () => {
    const details = await fetchStockDetails('AAPL');
    expect(details).toBeDefined();
  });

  it('should cache stock price', () => {
    cacheStockPrice('AAPL', 150.0);
    expect(getCachedStockPrice('AAPL')).resolves.toBe(150.0);
  });
});
