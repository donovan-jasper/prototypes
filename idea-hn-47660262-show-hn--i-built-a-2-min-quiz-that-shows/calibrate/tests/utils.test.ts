import { calculateBetaDistribution } from '../src/utils/betaDistribution';

test('Beta distribution calculates correctly', () => {
  const result = calculateBetaDistribution(5, 2); // 5 successes, 2 failures
  expect(result.mean).toBeCloseTo(0.714, 2); // 5/(5+2)
});
