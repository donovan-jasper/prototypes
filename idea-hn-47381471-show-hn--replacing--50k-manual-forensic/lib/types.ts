export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  documentId?: string;
  documentHash?: string;
  runningBalance?: number; // Added for trace results
  fee?: number; // Added for transaction fees
}

export interface Document {
  id: string;
  uri: string;
  hash: string;
  uploadDate: Date;
  ocrText: string;
  fileName?: string;
  fileSize?: number;
}
