import { classifySleepState } from '@/lib/ml/sleepClassifier';

describe('Sleep Classification', () => {
  it('classifies as asleep when all signals align', () => {
    const state = classifySleepState({
      motion: 0.01,
      sound: 25,
      light: 10,
    });
    expect(state).toBe('asleep');
  });

  it('classifies as awake if any signal is active', () => {
    const state = classifySleepState({
      motion: 0.5,
      sound: 25,
      light: 10,
    });
    expect(state).toBe('awake');
  });
});
