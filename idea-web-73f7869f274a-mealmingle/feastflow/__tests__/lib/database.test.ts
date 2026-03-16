import { initDatabase, createOrder, fetchOrders } from '../../lib/database';

describe('Database', () => {
  beforeAll(() => {
    initDatabase();
  });

  it('should create and fetch orders', async () => {
    const mockOrder = {
      restaurant: 'Test Restaurant',
      menuLink: 'http://test.com/menu',
      deadline: new Date().toISOString(),
      status: 'pending',
    };

    await new Promise((resolve) => {
      createOrder(mockOrder, (newOrder) => {
        expect(newOrder).toHaveProperty('id');
        expect(newOrder.restaurant).toBe(mockOrder.restaurant);

        fetchOrders((orders) => {
          expect(orders.length).toBeGreaterThan(0);
          expect(orders[0].restaurant).toBe(mockOrder.restaurant);
          resolve();
        });
      });
    });
  });
});
