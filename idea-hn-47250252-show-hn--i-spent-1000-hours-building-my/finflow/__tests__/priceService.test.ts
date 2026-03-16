import { fetchAssetPrice } from '../lib/priceService';

describe('Price service', () => {
  test('returns mock price for known symbol', async () => {
    const price = await fetchAssetPrice('AAPL');
    expect(price).toBeGreaterThan(0);
  });

  test('throws error for unknown symbol', async () => {
    await expect(fetchAssetPrice('INVALID')).rejects.toThrow();
  });
});
