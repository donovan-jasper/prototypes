import { switchMode, getActiveMode, shouldAutoSwitch } from '../lib/modeEngine';

describe('Mode Engine', () => {
  test('switches to specified mode', () => {
    const mode = { id: '1', name: 'Work', appIds: ['com.slack'] };
    switchMode(mode);
    expect(getActiveMode()).toEqual(mode);
  });

  test('auto-switches based on time trigger', () => {
    const workMode = {
      id: '1',
      name: 'Work',
      triggers: { time: { start: '09:00', end: '17:00' } }
    };
    const now = new Date('2026-03-16T10:00:00');
    expect(shouldAutoSwitch(workMode, now)).toBe(true);
  });
});
