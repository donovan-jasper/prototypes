import { renderHook, act } from '@testing-library/react-hooks';
import { usePayment } from '../../hooks/usePayment';

describe('usePayment', () => {
  it('should create and fetch payments', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePayment());

    const mockPayment = {
      orderId: 1,
      participantId: 1,
      amount: 10,
      status: 'pending',
    };

    await act(async () => {
      await result.current.createPayment(mockPayment);
    });

    await waitForNextUpdate();

    expect(result.current.payments.length).toBeGreaterThan(0);
    expect(result.current.payments[0].amount).toBe(mockPayment.amount);
  });
});
