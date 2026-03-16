import { Alert } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';

export const isFreeTier = async () => {
  // In a real implementation, you would check the user's subscription status
  // For the prototype, we'll simulate a free tier with a limit of 50 documents
  const documentCount = await getDocumentCount();
  return documentCount >= 50;
};

export const canExportPDF = async () => {
  // In a real implementation, you would check if the user has a premium subscription
  // For the prototype, we'll simulate a free user
  return false;
};

export const showPaywall = () => {
  Alert.alert(
    'Upgrade to Premium',
    'Unlock unlimited documents, multi-account tracking, and court-ready PDF exports.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Upgrade', onPress: () => navigateToSubscriptionScreen() },
    ]
  );
};

const navigateToSubscriptionScreen = () => {
  // In a real implementation, you would navigate to the subscription screen
  console.log('Navigate to subscription screen');
};

const getDocumentCount = async () => {
  // In a real implementation, you would query the database for the document count
  // For the prototype, we'll return a simulated count
  return 0;
};
