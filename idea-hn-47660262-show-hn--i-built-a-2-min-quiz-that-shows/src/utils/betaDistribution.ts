import { Beta } from 'beta-distribution';

export interface BetaResult {
  mean: number;
  variance: number;
  confidenceInterval: [number, number];
}

export const calculateBetaDistribution = (successes: number, failures: number): BetaResult => {
  const alpha = successes + 1; // +1 for Jeffreys prior
  const beta = failures + 1;
  const betaDist = new Beta(alpha, beta);

  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));

  // 95% confidence interval
  const lower = betaDist.ppf(0.025);
  const upper = betaDist.ppf(0.975);

  return {
    mean,
    variance,
    confidenceInterval: [lower, upper]
  };
};
