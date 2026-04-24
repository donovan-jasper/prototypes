export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  documentId: string;
  documentHash: string;
}

export interface Document {
  id: string;
  uri: string;
  hash: string;
  uploadDate: Date;
  ocrText: string;
}

export interface TraceResult {
  explained: boolean;
  gap: number;
  timeline: Transaction[];
  startBalance: number;
  endBalance: number;
}

export interface AuditPDFOptions {
  includeDocuments: boolean;
  includeHashes: boolean;
  watermark: boolean;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  documentCount: number;
  maxDocuments: number;
  expirationDate?: Date;
}
