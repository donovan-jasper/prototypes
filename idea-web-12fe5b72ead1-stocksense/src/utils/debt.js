export const calculateDebtPayoffPlan = (debts, monthlyIncome) => {
  // Validate inputs
  if (!debts || debts.length === 0) {
    throw new Error('No debts provided');
  }

  if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
    throw new Error('Invalid monthly income');
  }

  // Sort debts by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);

  // Calculate total debt
  const totalDebt = sortedDebts.reduce((sum, debt) => sum + debt.balance, 0);

  // Calculate available amount (30% of income)
  const availableAmount = monthlyIncome * 0.3;

  // Calculate payments using the avalanche method
  let remainingAmount = availableAmount;
  const payments = [];

  // First, pay minimum payments for all debts
  sortedDebts.forEach(debt => {
    payments.push({
      ...debt,
      monthlyPayment: Math.min(debt.minimumPayment, remainingAmount)
    });
    remainingAmount -= debt.minimumPayment;
  });

  // Then allocate remaining amount to highest interest debts
  for (let i = 0; i < sortedDebts.length && remainingAmount > 0; i++) {
    const debt = sortedDebts[i];
    const additionalPayment = Math.min(debt.balance, remainingAmount);
    payments[i].monthlyPayment += additionalPayment;
    remainingAmount -= additionalPayment;
  }

  // Calculate payoff dates and total interest saved
  let totalInterestSaved = 0;
  const payoffDates = [];

  sortedDebts.forEach((debt, index) => {
    const payment = payments[index].monthlyPayment;
    const monthsToPayoff = Math.ceil(debt.balance / payment);
    const interestPaid = (debt.balance * debt.interestRate / 100) * (monthsToPayoff / 12);
    const interestSaved = interestPaid - (debt.minimumPayment * monthsToPayoff);

    totalInterestSaved += interestSaved;

    payoffDates.push({
      debtId: debt.id,
      monthsToPayoff,
      payoffDate: new Date(
        new Date().setMonth(new Date().getMonth() + monthsToPayoff)
      ).toISOString()
    });
  });

  // Calculate total payoff time
  const totalPayoffMonths = Math.max(...payoffDates.map(p => p.monthsToPayoff));

  return {
    payments,
    totalDebt,
    totalInterestSaved,
    totalPayoffMonths,
    payoffDates,
    monthlyIncome,
    availableAmount
  };
};
