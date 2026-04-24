import { Transaction, FeeSchedule } from './types';

interface TraceResult {
  explained: boolean;
  gap: number;
  timeline: Transaction[];
  missingTransactions: boolean;
  totalFees: number;
  totalInterest: number;
  recurringTransactions: Transaction[];
}

export const traceMoney = (
  startBalance: number,
  endBalance: number,
  transactions: Transaction[],
  feeSchedules: FeeSchedule[] = [],
  tolerance: number = 0.01
): TraceResult => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balance
  let runningBalance = startBalance;
  let totalFees = 0;
  let totalInterest = 0;
  const timeline: Transaction[] = [];
  const recurringTransactions: Transaction[] = [];

  // Process recurring transactions first
  const now = new Date();
  for (const tx of sortedTransactions) {
    if (tx.recurring) {
      // Generate all occurrences of this recurring transaction
      let currentDate = new Date(tx.date);
      const endDate = tx.recurring.endDate || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      while (currentDate <= endDate) {
        const occurrence: Transaction = {
          ...tx,
          id: `${tx.id}-${currentDate.toISOString()}`,
          date: new Date(currentDate),
          recurring: undefined // Remove recurring flag for occurrences
        };

        // Apply fees if this is a withdrawal
        if (occurrence.type === 'withdrawal') {
          const feeSchedule = feeSchedules.find(f => f.accountType === occurrence.accountType);
          if (feeSchedule?.atmFee) {
            occurrence.fee = feeSchedule.atmFee;
            totalFees += feeSchedule.atmFee;
          }
        }

        // Calculate interest if applicable
        if (occurrence.accountType === 'savings' && occurrence.interestRate) {
          const daysInPeriod = 30; // Assuming monthly compounding
          const interest = (runningBalance * occurrence.interestRate / 100) / 365 * daysInPeriod;
          totalInterest += interest;
          runningBalance += interest;
          timeline.push({
            ...occurrence,
            id: `${occurrence.id}-interest`,
            type: 'interest',
            amount: interest,
            payee: 'Interest Earned',
            runningBalance
          });
        }

        // Add the transaction to timeline
        runningBalance += occurrence.amount - (occurrence.fee || 0);
        timeline.push({
          ...occurrence,
          runningBalance
        });

        // Add to recurring transactions list
        recurringTransactions.push(occurrence);

        // Calculate next occurrence
        switch (tx.recurring.frequency) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        }
      }
    }
  }

  // Process one-time transactions
  for (const tx of sortedTransactions) {
    if (!tx.recurring) {
      // Apply fees if this is a withdrawal
      if (tx.type === 'withdrawal') {
        const feeSchedule = feeSchedules.find(f => f.accountType === tx.accountType);
        if (feeSchedule?.atmFee) {
          tx.fee = feeSchedule.atmFee;
          totalFees += feeSchedule.atmFee;
        }
      }

      // Calculate interest if applicable
      if (tx.accountType === 'savings' && tx.interestRate) {
        const daysInPeriod = 30; // Assuming monthly compounding
        const interest = (runningBalance * tx.interestRate / 100) / 365 * daysInPeriod;
        totalInterest += interest;
        runningBalance += interest;
        timeline.push({
          ...tx,
          id: `${tx.id}-interest`,
          type: 'interest',
          amount: interest,
          payee: 'Interest Earned',
          runningBalance
        });
      }

      // Add the transaction to timeline
      runningBalance += tx.amount - (tx.fee || 0);
      timeline.push({
        ...tx,
        runningBalance
      });
    }
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
    totalFees,
    totalInterest,
    recurringTransactions
  };
};
