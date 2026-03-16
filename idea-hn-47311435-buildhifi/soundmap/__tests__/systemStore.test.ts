import { renderHook, act } from '@testing-library/react-native';
import { useSystemStore } from '../lib/store/systemStore';

describe('System Store', () => {
  test('adds component to system', () => {
    const { result } = renderHook(() => useSystemStore());

    act(() => {
      result.current.addComponent({
        id: '1',
        type: 'receiver',
        name: 'Test Receiver'
      });
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].name).toBe('Test Receiver');
  });

  test('removes component from system', () => {
    const { result } = renderHook(() => useSystemStore());

    act(() => {
      result.current.addComponent({ id: '1', type: 'receiver', name: 'Test' });
      result.current.removeComponent('1');
    });

    expect(result.current.components).toHaveLength(0);
  });

  test('enforces free tier limits', () => {
    const { result } = renderHook(() => useSystemStore());

    act(() => {
      result.current.setPremium(false);
      result.current.createSystem('System 1');
      result.current.createSystem('System 2');
    });

    expect(result.current.systems).toHaveLength(1);
  });
});
