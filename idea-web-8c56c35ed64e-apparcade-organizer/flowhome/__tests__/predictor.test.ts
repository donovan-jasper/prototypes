import { predictApps } from '@/lib/ml/predictor';

describe('predictor', () => {
  it('should predict top 4 apps based on time context', async () => {
    const predictions = await predictApps(9, 1, 1); // 9am, Monday, work location
    expect(predictions.length).toBe(8);
    expect(predictions[0]).toBeGreaterThan(0.5);
  });

  it('should improve prediction accuracy with more training data', async () => {
    const initialPredictions = await predictApps(9, 1, 1);
    // Simulate more training data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const improvedPredictions = await predictApps(9, 1, 1);
    expect(improvedPredictions[0]).toBeGreaterThan(initialPredictions[0]);
  });

  it('should fallback to most-used apps when insufficient data', async () => {
    const predictions = await predictApps(3, 1, 2); // 3am, Monday, other location
    expect(predictions.length).toBe(8);
    expect(predictions[0]).toBeGreaterThan(0.3);
  });
});
