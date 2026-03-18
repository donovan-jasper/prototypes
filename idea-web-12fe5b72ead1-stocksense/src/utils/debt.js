export const calculateDebtPayoffPlan = (debts, monthlyIncome) => {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  const totalAvailable = monthlyIncome * 0.3;
  const totalDebt = sortedDebts.reduce((sum, debt) => sum + debt.amount, 0);
  
  return sortedDebts.map(debt => ({
    ...debt,
    monthlyPayment: (debt.amount / totalDebt) * totalAvailable
  }));
};
