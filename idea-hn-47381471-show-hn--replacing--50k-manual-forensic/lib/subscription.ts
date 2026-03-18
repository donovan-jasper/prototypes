import { Alert } from 'react-native';
import { getTransactions } from './database';

export const isFreeTier = async () => {
  try {
    const transactions = await getTransactions();
    return transactions.length >= 50;
  } catch (error) {
    console.error('Error checking tier:', error);
    return false;
  }
};

export const canExportPDF = async () => {
  // For prototype, simulate free tier
  return false;
};

export const showPaywall = () => {
  Alert.alert(
    'Upgrade to Premium',
    'You have reached the free tier limit of 50 documents. Upgrade to Premium for unlimited documents, multi-account tracking, and court-ready PDF exports.',
    [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Upgrade Now', onPress: () => console.log('Navigate to subscription') },
    ]
  );
};
