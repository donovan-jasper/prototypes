import { fetchItemPrice, shouldBuyNow } from '../lib/api/priceService';

describe('priceService', () => {
  it('fetches current price for item', async () => {
    const price = await fetchItemPrice('fortnite', 'item-123');
    expect(price).toBeGreaterThan(0);
  });

  it('recommends buying when price is below 30-day average', () => {
    const recommendation = shouldBuyNow(800, 1000);
    expect(recommendation).toBe(true);
  });
});
