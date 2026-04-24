export const fetchMarketData = async () => {
  // Fetch market data from Alpha Vantage API
  return "Market is up 2%";
};

export const fetchTransactions = async () => {
  // Sample transactions with descriptions for auto-categorization
  return [
    { amount: 45.32, description: 'Whole Foods Market' },
    { amount: 120.50, description: 'Safeway Grocery Store' },
    { amount: 5.75, description: 'Starbucks Coffee' },
    { amount: 32.00, description: 'Shell Gas Station' },
    { amount: 15.99, description: 'Netflix Entertainment' },
    { amount: 67.80, description: 'Target Retail Shopping' },
    { amount: 89.99, description: 'Electric Utility Bill' },
    { amount: 25.00, description: 'Uber Transportation' },
    { amount: 42.15, description: 'CVS Pharmacy' },
    { amount: 18.50, description: 'Local Restaurant' },
    { amount: 95.00, description: 'Trader Joes Supermarket' },
    { amount: 12.00, description: 'City Transit Pass' },
    { amount: 55.00, description: 'Internet Service Provider' },
    { amount: 38.25, description: 'Amazon Shopping' },
    { amount: 72.00, description: 'Medical Clinic Visit' }
  ];
};

export const fetchUserDebtInfo = async () => {
  // Mock data for the DebtRoadmap component
  return {
    debts: [
      {
        id: 1,
        balance: 5000,
        interestRate: 18.5,
        minimumPayment: 150
      },
      {
        id: 2,
        balance: 12000,
        interestRate: 6.2,
        minimumPayment: 200
      },
      {
        id: 3,
        balance: 3000,
        interestRate: 12.0,
        minimumPayment: 100
      }
    ],
    monthlyIncome: 4500,
    totalDebt: 20000
  };
};
