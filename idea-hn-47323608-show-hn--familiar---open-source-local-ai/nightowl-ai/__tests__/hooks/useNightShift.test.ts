import { renderHook, act } from '@testing-library/react-native';
import { useNightShift } from '@/hooks/useNightShift';

describe('useNightShift', () => {
  it('should enable night shift mode', async () => {
    const { result } = renderHook(() => useNightShift());

    await act(async () => {
      await result.current.enable({ startHour: 2, endHour: 6 });
    });

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.schedule.startHour).toBe(2);
  });

  it('should check if currently in night shift window', () => {
    const { result } = renderHook(() => useNightShift());

    const now = new Date();
    now.setHours(3); // 3am

    const isActive = result.current.isInWindow(now, { startHour: 2, endHour: 6 });
    expect(isActive).toBe(true);
  });
});
