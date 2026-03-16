import { renderHook, act } from '@testing-library/react-native';
import { usePlants } from '../hooks/usePlants';

describe('usePlants hook', () => {
  test('loads plants on mount', async () => {
    const { result } = renderHook(() => usePlants());
    await act(async () => {
      await result.current.loadPlants();
    });
    expect(result.current.plants).toBeDefined();
  });

  test('adds a new plant', async () => {
    const { result } = renderHook(() => usePlants());
    await act(async () => {
      await result.current.addPlant({
        name: 'Fiddle Leaf Fig',
        species: 'Ficus lyrata',
        wateringFrequency: 7,
      });
    });
    expect(result.current.plants.length).toBeGreaterThan(0);
  });
});
