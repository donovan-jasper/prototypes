import { activateFocusMode, getCurrentMode } from '../store/useAppStore';

describe('Focus Mode', () => {
  it('should activate a focus mode', () => {
    const mode = { id: '1', name: 'Study', color: '#3498DB' };
    activateFocusMode(mode);

    const current = getCurrentMode();
    expect(current?.name).toBe('Study');
  });
});
