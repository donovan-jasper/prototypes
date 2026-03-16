import { calculateWeeklyEarnings, getTopProducts, suggestPostingTime } from '../lib/utils/analytics';

describe('Analytics', () => {
  const sales = [
    {
      id: 1,
      productId: 1,
      platformId: 1,
      amount: 10.99,
      soldAt: new Date().toISOString(),
      productTitle: 'Product 1',
    },
    {
      id: 2,
      productId: 2,
      platformId: 1,
      amount: 12.99,
      soldAt: new Date().toISOString(),
      productTitle: 'Product 2',
    },
    {
      id: 3,
      productId: 1,
      platformId: 2,
      amount: 10.99,
      soldAt: new Date().toISOString(),
      productTitle: 'Product 1',
    },
  ];

  it('should calculate weekly earnings', () => {
    const earnings = calculateWeeklyEarnings(sales);
    expect(earnings.total).toBeGreaterThan(0);
    expect(earnings.change).toBeDefined();
  });

  it('should get top products', () => {
    const topProducts = getTopProducts(sales, 2);
    expect(topProducts.length).toBe(2);
    expect(topProducts[0].title).toBe('Product 1');
  });

  it('should suggest posting time', () => {
    const postingTime = suggestPostingTime(sales);
    expect(postingTime).toBeDefined();
  });
});
