import { calculateNextCueTime, getCueIntensity } from '../lib/session/adaptiveAlgorithm';

describe('Adaptive Algorithm', () => {
  test('increases cue frequency as session progresses', () => {
    const earlyTime = calculateNextCueTime(2, 20); // 2 min into 20 min session
    const lateTime = calculateNextCueTime(18, 20); // 18 min into 20 min session
    expect(lateTime).toBeLessThan(earlyTime);
  });

  test('cue intensity increases near end of session', () => {
    const earlyIntensity = getCueIntensity(3, 20);
    const lateIntensity = getCueIntensity(17, 20);
    expect(lateIntensity).toBeGreaterThan(earlyIntensity);
  });

  test('early session cues are 3-5 minutes apart', () => {
    const time = calculateNextCueTime(1, 20);
    expect(time).toBeGreaterThanOrEqual(150); // ~2.5 min minimum
    expect(time).toBeLessThanOrEqual(330); // ~5.5 min maximum (with randomization)
  });

  test('late session cues are 30-60 seconds apart', () => {
    const time = calculateNextCueTime(19, 20);
    expect(time).toBeGreaterThanOrEqual(27); // 30s with randomization
    expect(time).toBeLessThanOrEqual(66); // 60s with randomization
  });

  test('intensity starts at 0.3', () => {
    const intensity = getCueIntensity(0, 20);
    expect(intensity).toBeCloseTo(0.3, 1);
  });

  test('intensity ends at 1.0', () => {
    const intensity = getCueIntensity(20, 20);
    expect(intensity).toBeCloseTo(1.0, 1);
  });

  test('intensity increases linearly', () => {
    const intensity1 = getCueIntensity(5, 20);
    const intensity2 = getCueIntensity(10, 20);
    const intensity3 = getCueIntensity(15, 20);
    
    expect(intensity2).toBeGreaterThan(intensity1);
    expect(intensity3).toBeGreaterThan(intensity2);
    
    // Check linearity
    const diff1 = intensity2 - intensity1;
    const diff2 = intensity3 - intensity2;
    expect(Math.abs(diff1 - diff2)).toBeLessThan(0.01);
  });
});
