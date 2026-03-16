import { Transaction } from './types';

export const traceMoney = (
  startBalance: number,
  endBalance: number,
  transactions: Transaction[]
) => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balance
  let runningBalance = startBalance;
  const timeline = [];

  for (const tx of sortedTransactions) {
    runningBalance += tx.amount;
    timeline.push({
      ...tx,
      runningBalance
    });
  }

  // Check if the final balance matches the expected end balance
  const explained = Math.abs(runningBalance - endBalance) < 0.01;
  const gap = endBalance - runningBalance;

  return {
    explained,
    gap,
    timeline,
    endingBalance: runningBalance
  };
};
