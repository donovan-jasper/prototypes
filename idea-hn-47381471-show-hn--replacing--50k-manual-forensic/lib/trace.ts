import { Transaction } from './types';

interface TraceResult {
  explained: boolean;
  gap: number;
  timeline: Transaction[];
}

export const traceMoney = (
  startBalance: number,
  endBalance: number,
  transactions: Transaction[]
): TraceResult => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balance
  let runningBalance = startBalance;
  const timeline: Transaction[] = [];

  for (const tx of sortedTransactions) {
    runningBalance += tx.amount;
    timeline.push({
      ...tx,
      runningBalance
    });
  }

  // Calculate gap
  const gap = endBalance - runningBalance;

  return {
    explained: Math.abs(gap) < 0.01, // Account for floating point precision
    gap,
    timeline
  };
};
