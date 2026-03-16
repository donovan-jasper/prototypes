import { initML, predictOptimalTime } from '../lib/ml-engine';

describe('ML Engine', () => {
  beforeAll(async () => {
    await initML();
  });

  test('should predict optimal time', () => {
    const userData = { /* mock user data */ };
    const optimalTime = predictOptimalTime(userData);
    expect(optimalTime).toBeInstanceOf(Date);
  });
});
