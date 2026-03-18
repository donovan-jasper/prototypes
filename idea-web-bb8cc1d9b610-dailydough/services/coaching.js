export async function generateCoachingTip() {
  const tips = [
    { tip: 'Track every expense, no matter how small. Small purchases add up quickly.', category: 'Budgeting' },
    { tip: 'Set up automatic transfers to your savings account on payday.', category: 'Savings' },
    { tip: 'Review your subscriptions monthly and cancel unused services.', category: 'Expenses' },
    { tip: 'Build an emergency fund covering 3-6 months of expenses.', category: 'Savings' },
    { tip: 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.', category: 'Budgeting' }
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}
