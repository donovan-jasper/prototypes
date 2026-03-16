import { Transaction, Holding, Asset, Liability } from './types';

export const calculateNetWorth = (assets: Asset[], liabilities: Liability[]): number => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  return totalAssets - totalLiabilities;
};

export const calculatePortfolioGains = (holdings: Holding[]): { totalGain: number; percentGain: number } => {
  const totalGain = holdings.reduce((sum, holding) => {
    const holdingGain = (holding.currentPrice - holding.costBasis) * holding.shares;
    return sum + holdingGain;
  }, 0);

  const totalCostBasis = holdings.reduce((sum, holding) => sum + holding.costBasis * holding.shares, 0);
  const percentGain = totalCostBasis !== 0 ? (totalGain / totalCostBasis) * 100 : 0;

  return { totalGain, percentGain };
};

export const calculateMonthlySpending = (transactions: Transaction[], month: number, year: number): Record<string, number> => {
  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
  });

  return monthlyTransactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {});
};

export const calculateBudgetProgress = (transactions: Transaction[], budgets: Record<string, number>, month: number, year: number): Record<string, number> => {
  const monthlySpending = calculateMonthlySpending(transactions, month, year);

  return Object.keys(budgets).reduce((acc, category) => {
    acc[category] = (monthlySpending[category] || 0) / budgets[category];
    return acc;
  }, {});
};
