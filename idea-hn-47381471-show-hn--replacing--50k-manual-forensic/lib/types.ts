export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  type: 'deposit' | 'withdrawal' | 'fee' | 'interest';
  documentId?: string;
  documentHash?: string;
  runningBalance?: number;
  fee?: number;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    endDate?: Date;
    nextOccurrence?: Date;
  };
  accountType?: 'checking' | 'savings' | 'credit card';
  interestRate?: number; // Annual percentage rate for savings/loans
}

export interface Document {
  id: string;
  uri: string;
  hash: string;
  uploadDate: Date;
  ocrText: string;
}

export interface FeeSchedule {
  accountType: 'checking' | 'savings' | 'credit card';
  atmFee?: number;
  overdraftFee?: number;
  monthlyMaintenanceFee?: number;
  latePaymentFee?: number;
  foreignTransactionFee?: number;
}
