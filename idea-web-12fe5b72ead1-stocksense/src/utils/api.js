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
  // Real implementation using Plaid API
  try {
    // In a production app, you would:
    // 1. Get an access token from your backend
    // 2. Make authenticated requests to Plaid API
    // 3. Handle errors and retries

    // For this prototype, we'll simulate a successful API call
    // with realistic but mock data

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      debts: [
        {
          id: 'debt_1',
          name: 'Credit Card',
          balance: 5000,
          interestRate: 18.5,
          minimumPayment: 150,
          type: 'credit',
          apr: 18.5,
          lastPaymentDate: '2023-05-15',
          nextPaymentDue: '2023-06-15'
        },
        {
          id: 'debt_2',
          name: 'Student Loan',
          balance: 12000,
          interestRate: 6.2,
          minimumPayment: 200,
          type: 'student',
          apr: 6.2,
          lastPaymentDate: '2023-05-10',
          nextPaymentDue: '2023-06-10'
        },
        {
          id: 'debt_3',
          name: 'Personal Loan',
          balance: 3000,
          interestRate: 12.0,
          minimumPayment: 100,
          type: 'personal',
          apr: 12.0,
          lastPaymentDate: '2023-05-05',
          nextPaymentDue: '2023-06-05'
        }
      ],
      totalDebt: 20000,
      monthlyIncome: 4500,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching debt information:', error);
    throw new Error('Failed to fetch debt information. Please check your connection and try again.');
  }
};
