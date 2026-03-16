import { renderHook, act } from '@testing-library/react';
import { useInventoryStore } from '../lib/stores/inventoryStore';

describe('inventoryStore', () => {
  it('adds item to inventory', () => {
    const { result } = renderHook(() => useInventoryStore());
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Legendary Sword',
        game: 'Fortnite',
        rarity: 'legendary',
        value: 1500
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Legendary Sword');
  });

  it('calculates total portfolio value', () => {
    const { result } = renderHook(() => useInventoryStore());
    act(() => {
      result.current.addItem({ id: '1', name: 'Item 1', game: 'Game', rarity: 'common', value: 100 });
      result.current.addItem({ id: '2', name: 'Item 2', game: 'Game', rarity: 'common', value: 250 });
    });
    expect(result.current.totalValue).toBe(350);
  });
});
