import { startTimer, getTimeRemaining } from '../components/Timer';

describe('Pomodoro Timer', () => {
  it('should start a 25-minute timer', () => {
    startTimer(25);
    const remaining = getTimeRemaining();

    expect(remaining).toBe(25 * 60);
  });
});
