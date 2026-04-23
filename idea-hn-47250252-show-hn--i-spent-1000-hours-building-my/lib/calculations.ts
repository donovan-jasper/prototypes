import { Holding, PortfolioSummary, Asset, Liability, NetWorth } from './types';

export const calculatePortfolioGains = (holdings: Holding[]): PortfolioSummary => {
  let totalValue = 0;
  let totalCostBasis = 0;

  const updatedHoldings = holdings.map(holding => {
    const currentValue = holding.shares * (holding.currentPrice || 0);
    const costBasis = holding.shares * holding.costBasis;
    const gain = currentValue - costBasis;
    const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

    totalCostBasis += costBasis;
    totalValue += currentValue;

    return {
      ...holding,
      currentValue,
      gain,
      percentGain
    };
  });

  const totalGain = totalValue - totalCostBasis;
  const totalPercentGain = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalGain,
    totalPercentGain,
    holdings: updatedHoldings,
  };
};

export const calculateNetWorth = (assets: Asset[], liabilities: Liability[]): NetWorth => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    netWorth
  };
};

export const calculateHoldingDetails = (holding: Holding): Holding => {
  const currentValue = holding.shares * (holding.currentPrice || 0);
  const costBasis = holding.shares * holding.costBasis;
  const gain = currentValue - costBasis;
  const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  return {
    ...holding,
    currentValue,
    gain,
    percentGain
  };
};
