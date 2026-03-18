export const calculateSpendingTrend = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }
  
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  return total / transactions.length;
};
