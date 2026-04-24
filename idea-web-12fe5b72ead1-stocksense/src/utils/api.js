import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': 'YOUR_PLAID_CLIENT_ID',
      'PLAID-SECRET': 'YOUR_PLAID_SECRET',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

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
  try {
    // In a real implementation, you would call Plaid's API here
    // For example:
    // const response = await plaidClient.liabilitiesGet({
    //   access_token: 'user_access_token'
    // });

    // Mock data for the DebtRoadmap component
    const mockDebtData = {
      debts: [
        {
          name: 'Credit Card',
          amount: 5000,
          interestRate: 18.5,
          monthlyPayment: 200
        },
        {
          name: 'Student Loan',
          amount: 12000,
          interestRate: 6.2,
          monthlyPayment: 300
        },
        {
          name: 'Personal Loan',
          amount: 3000,
          interestRate: 12.0,
          monthlyPayment: 150
        }
      ],
      monthlyIncome: 4500,
      totalDebt: 5000 + 12000 + 3000,
      totalPayoffMonths: Math.max(
        Math.ceil(5000 / 200),
        Math.ceil(12000 / 300),
        Math.ceil(3000 / 150)
      ),
      totalInterestSaved: 0 // This would be calculated based on actual interest paid
    };

    // Calculate total interest saved by comparing to minimum payment scenario
    const calculateInterestSaved = (debts) => {
      let totalInterest = 0;
      debts.forEach(debt => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const monthsToPayoff = Math.ceil(debt.amount / debt.monthlyPayment);
        let remainingBalance = debt.amount;

        for (let i = 0; i < monthsToPayoff; i++) {
          const interest = remainingBalance * monthlyRate;
          totalInterest += interest;
          remainingBalance -= (debt.monthlyPayment - interest);
        }
      });

      // Calculate what interest would be if paying minimum payments
      let totalMinPaymentInterest = 0;
      debts.forEach(debt => {
        const monthlyRate = debt.interestRate / 100 / 12;
        let remainingBalance = debt.amount;
        const minPayment = debt.amount * 0.02; // Assume minimum payment is 2% of balance

        for (let i = 0; i < 120; i++) { // Cap at 10 years for comparison
          const interest = remainingBalance * monthlyRate;
          totalMinPaymentInterest += interest;
          remainingBalance -= (minPayment - interest);

          if (remainingBalance <= 0) break;
        }
      });

      return Math.max(0, totalMinPaymentInterest - totalInterest);
    };

    mockDebtData.totalInterestSaved = calculateInterestSaved(mockDebtData.debts);

    return mockDebtData;
  } catch (error) {
    console.error('Error fetching debt info:', error);
    throw error;
  }
};
