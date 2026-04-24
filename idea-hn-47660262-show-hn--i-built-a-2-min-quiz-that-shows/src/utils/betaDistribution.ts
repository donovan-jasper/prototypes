export interface BetaDistributionResult {
  mean: number;
  variance: number;
  confidenceInterval: [number, number];
}

export const calculateBetaDistribution = (successes: number, failures: number): BetaDistributionResult => {
  const alpha = successes + 1; // Adding 1 for Bayesian smoothing
  const beta = failures + 1;

  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));

  // 95% confidence interval using Wilson score interval
  const n = alpha + beta;
  const z = 1.96; // 95% confidence
  const lower = (mean + (z * z) / (2 * n) - z * Math.sqrt((mean * (1 - mean) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
  const upper = (mean + (z * z) / (2 * n) + z * Math.sqrt((mean * (1 - mean) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);

  return {
    mean,
    variance,
    confidenceInterval: [Math.max(0, lower), Math.min(1, upper)]
  };
};
