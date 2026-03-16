export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  type: 'deposit' | 'withdrawal';
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
