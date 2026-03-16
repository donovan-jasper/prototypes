import { searchProducts, getProductById } from '../lib/database/queries';

describe('Database Queries', () => {
  test('searches products by name', async () => {
    const results = await searchProducts('yamaha');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('yamaha');
  });

  test('filters by category', async () => {
    const results = await searchProducts('', 'receiver');
    expect(results.every(p => p.category === 'receiver')).toBe(true);
  });

  test('retrieves product by ID', async () => {
    const product = await getProductById('1');
    expect(product).toBeDefined();
    expect(product?.id).toBe('1');
  });
});
