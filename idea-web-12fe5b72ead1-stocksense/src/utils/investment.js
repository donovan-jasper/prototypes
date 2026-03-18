export const calculateInvestmentProjection = (monthlyInvestment, annualReturnRate, years) => {
  const monthlyRate = annualReturnRate / 12 / 100;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyInvestment * totalMonths;
  }
  
  const futureValue = monthlyInvestment * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  return futureValue;
};
