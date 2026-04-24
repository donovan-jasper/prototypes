export const calculateBetaDistribution = (successes: number, failures: number): { mean: number, variance: number } => {
  const alpha = successes + 1;
  const beta = failures + 1;

  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));

  return { mean, variance };
};
