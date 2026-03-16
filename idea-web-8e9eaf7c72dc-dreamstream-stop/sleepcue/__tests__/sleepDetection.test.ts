import { analyzeMotion } from '../utils/motionAnalysis';
import { analyzeAudio } from '../utils/audioAnalysis';

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
});

describe('Audio Analysis', () => {
  it('should detect sleep pattern with low amplitude and low-frequency energy', () => {
    // Mock low-frequency audio data
    const sleepAudioData = Array(10).fill(new Float32Array(1000).fill(0.01));
    const result = analyzeAudio(sleepAudioData);
    expect(result.isSleepPattern).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('should detect non-sleep pattern with high amplitude or high-frequency energy', () => {
    // Mock high-frequency audio data
    const noiseAudioData = Array(10).fill(new Float32Array(1000).fill(0.5));
    const result = analyzeAudio(noiseAudioData);
    expect(result.isSleepPattern).toBe(false);
    expect(result.confidence).toBeLessThan(0.4);
  });

  it('should handle empty data', () => {
    const result = analyzeAudio([]);
    expect(result.isSleepPattern).toBe(false);
    expect(result.confidence).toBe(0);
  });
});
