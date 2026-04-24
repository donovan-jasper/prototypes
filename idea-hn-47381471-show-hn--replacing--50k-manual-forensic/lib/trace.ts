import { Transaction } from './types';

interface TraceResult {
  explained: boolean;
  gap: number;
  timeline: Transaction[];
  missingTransactions: boolean;
}

export const traceMoney = (
  startBalance: number,
  endBalance: number,
  transactions: Transaction[],
  tolerance: number = 0.01,
  fee: number = 0
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
    // Apply transaction fee if this is a withdrawal
    if (tx.type === 'withdrawal' && tx.fee) {
      runningBalance -= tx.fee;
    }
    timeline.push({
      ...tx,
      runningBalance
    });
  }

  // Apply overall fee if specified
  if (fee > 0) {
    runningBalance -= fee;
  }

  // Calculate gap
  const gap = endBalance - runningBalance;

  // Check if gap exceeds tolerance
  const missingTransactions = Math.abs(gap) > tolerance;

  return {
    explained: Math.abs(gap) <= tolerance,
    gap,
    timeline,
    missingTransactions
  };
};
