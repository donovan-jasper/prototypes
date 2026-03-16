import { analyzeMotion } from '../utils/motionAnalysis';

describe('Motion Analysis', () => {
  it('should detect stillness with low magnitude and low standard deviation', () => {
    const stillData = Array(100).fill({ x: 0.01, y: 0.01, z: 0.01 });
    const result = analyzeMotion(stillData);
    expect(result.isStill).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should detect movement with high magnitude or high standard deviation', () => {
    const movingData = Array(100).fill({ x: 0.5, y: 0.5, z: 0.5 });
    const result = analyzeMotion(movingData);
    expect(result.isStill).toBe(false);
    expect(result.confidence).toBeLessThan(0.3);
  });

  it('should handle empty data', () => {
    const result = analyzeMotion([]);
    expect(result.isStill).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('should handle noisy data', () => {
    // Create data with some noise
    const noisyData = Array(100).fill({ x: 0.01, y: 0.01, z: 0.01 }).map((point, index) => {
      if (index % 10 === 0) {
        return { x: 0.5, y: 0.5, z: 0.5 };
      }
      return point;
    });
    const result = analyzeMotion(noisyData);
    expect(result.isStill).toBe(false);
    expect(result.confidence).toBeLessThan(0.5);
  });
});
