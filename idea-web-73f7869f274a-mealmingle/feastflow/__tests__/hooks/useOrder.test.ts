import { renderHook, act } from '@testing-library/react-hooks';
import { useOrder } from '../../hooks/useOrder';

describe('useOrder', () => {
  it('should create and fetch orders', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useOrder());

    const mockOrder = {
      restaurant: 'Test Restaurant',
      menuLink: 'http://test.com/menu',
      deadline: new Date().toISOString(),
      status: 'pending',
    };

    await act(async () => {
      await result.current.createOrder(mockOrder);
    });

    await waitForNextUpdate();

    expect(result.current.orders.length).toBeGreaterThan(0);
    expect(result.current.orders[0].restaurant).toBe(mockOrder.restaurant);
  });
});
