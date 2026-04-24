import { Transaction } from './types';

interface TraceResult {
  explained: boolean;
  gap: number;
  timeline: Transaction[];
  missingTransactions: boolean;
  totalFees: number;
}

export const traceMoney = (
  startBalance: number,
  endBalance: number,
  transactions: Transaction[],
  tolerance: number = 0.01,
  transactionFee: number = 0,
  overallFee: number = 0
): TraceResult => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balance
  let runningBalance = startBalance;
  let totalFees = 0;
  const timeline: Transaction[] = [];

  for (const tx of sortedTransactions) {
    // Apply transaction fee if this is a withdrawal and fee is specified
    let feeAmount = 0;
    if (tx.type === 'withdrawal' && transactionFee > 0) {
      feeAmount = transactionFee;
      totalFees += feeAmount;
    }

    runningBalance += tx.amount - feeAmount;
    timeline.push({
      ...tx,
      runningBalance,
      fee: feeAmount
    });
  }

  // Apply overall fee if specified
  if (overallFee > 0) {
    runningBalance -= overallFee;
    totalFees += overallFee;
  }

  // Calculate gap
  const gap = endBalance - runningBalance;

  // Check if gap exceeds tolerance
  const missingTransactions = Math.abs(gap) > tolerance;

  return {
    explained: Math.abs(gap) <= tolerance,
    gap,
    timeline,
    missingTransactions,
    totalFees
  };
};
