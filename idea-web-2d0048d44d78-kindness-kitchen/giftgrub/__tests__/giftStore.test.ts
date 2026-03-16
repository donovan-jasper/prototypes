import { renderHook, act } from '@testing-library/react-hooks';
import { useGiftStore } from '../store/giftStore';

describe('Gift Store', () => {
  it('should add a new gift', () => {
    const { result } = renderHook(() => useGiftStore());

    act(() => {
      result.current.addGift({
        recipientName: 'Alice',
        restaurant: 'Pizza Palace',
        message: 'Happy Birthday!',
        scheduledFor: new Date('2026-03-20'),
      });
    });

    expect(result.current.gifts).toHaveLength(1);
    expect(result.current.gifts[0].recipientName).toBe('Alice');
  });

  it('should update gift status', () => {
    const { result } = renderHook(() => useGiftStore());

    act(() => {
      result.current.addGift({
        recipientName: 'Bob',
        restaurant: 'Taco Town',
        message: 'Get well soon!',
      });
    });

    const giftId = result.current.gifts[0].id;

    act(() => {
      result.current.updateGiftStatus(giftId, 'delivered');
    });

    expect(result.current.gifts[0].status).toBe('delivered');
  });
});
