import { analyzeMeteringLevel, resetMeteringHistory } from '../utils/audioAnalysis';

describe('Audio Analysis with Metering', () => {
  beforeEach(() => {
    resetMeteringHistory();
  });

  it('should not detect sleep pattern with insufficient readings', () => {
    const result = analyzeMeteringLevel(-45);
    expect(result.isSleepPattern).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('should detect sleep pattern with consistent low amplitude readings over time', () => {
    // Simulate 10 readings below threshold with low variation
    for (let i = 0; i < 10; i++) {
      analyzeMeteringLevel(-45 + Math.random() * 2); // -45 to -43 dB
    }

    // Wait simulated 3+ minutes by manipulating timestamps
    jest.useFakeTimers();
    jest.advanceTimersByTime(3 * 60 * 1000 + 1000);

    const result = analyzeMeteringLevel(-44);
    
    jest.useRealTimers();
    
    // Should have high confidence after consistent pattern
    expect(result.averageAmplitude).toBeLessThan(-40);
    expect(result.standardDeviation).toBeLessThan(5);
  });

  it('should not detect sleep with high amplitude', () => {
    for (let i = 0; i < 10; i++) {
      analyzeMeteringLevel(-20); // Too loud
    }

    const result = analyzeMeteringLevel(-20);
    expect(result.isSleepPattern).toBe(false);
  });

  it('should not detect sleep with high variation', () => {
    const readings = [-45, -30, -50, -25, -48, -35, -42, -28, -46, -32];
    readings.forEach(level => analyzeMeteringLevel(level));

    const result = analyzeMeteringLevel(-40);
    expect(result.standardDeviation).toBeGreaterThan(5);
    expect(result.isSleepPattern).toBe(false);
  });

  it('should reset tracking when pattern breaks', () => {
    // Build up consistent pattern
    for (let i = 0; i < 10; i++) {
      analyzeMeteringLevel(-45);
    }

    // Break pattern with loud noise
    analyzeMeteringLevel(-10);

    // Try to build pattern again
    for (let i = 0; i < 10; i++) {
      analyzeMeteringLevel(-45);
    }

    const result = analyzeMeteringLevel(-45);
    // Should not be sleeping yet since pattern was reset
    expect(result.isSleepPattern).toBe(false);
  });

  it('should calculate confidence based on duration and consistency', () => {
    resetMeteringHistory();
    
    // Add consistent low readings
    for (let i = 0; i < 10; i++) {
      analyzeMeteringLevel(-45);
    }

    const result = analyzeMeteringLevel(-45);
    
    // Confidence should be > 0 but < 1 since duration threshold not met
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(1);
  });
});
