import { encryptMessage, decryptMessage } from './encryption';
import { getExpenses } from './database';

export const generateQRCode = async () => {
  // Generate QR code data
  return 'sample-qr-code-data';
};

export const createSyncPayload = async () => {
  const expenses = await getExpenses();
  return {
    expenses,
    timestamp: new Date().toISOString(),
  };
};

export const applySyncPayload = async (payload) => {
  // Merge remote changes into local DB
  console.log('Applying sync payload:', payload);
};
