import { Holding, PortfolioSummary } from './types';

export const calculatePortfolioGains = (holdings: Holding[]): PortfolioSummary => {
  let totalValue = 0;
  let totalCostBasis = 0;

  holdings.forEach((holding) => {
    const costBasis = holding.shares * holding.costBasis;
    const currentValue = holding.shares * (holding.currentPrice || 0);

    totalCostBasis += costBasis;
    totalValue += currentValue;
  });

  const totalGain = totalValue - totalCostBasis;
  const totalPercentGain = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalGain,
    totalPercentGain,
    holdings,
  };
};

export const calculateNetWorth = (assets: { value: number }[], liabilities: { value: number }[]) => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  return totalAssets - totalLiabilities;
};
