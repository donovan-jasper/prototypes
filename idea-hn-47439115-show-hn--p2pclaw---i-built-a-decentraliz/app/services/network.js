import NetInfo from '@react-native-community/netinfo';
import { addPendingSubmission, getPendingSubmissions, removePendingSubmission } from './database';

let isOnline = false;

export const initNetworkMonitoring = (onStatusChange) => {
  NetInfo.addEventListener(state => {
    isOnline = state.isConnected;
    onStatusChange(isOnline);
    if (isOnline) {
      processPendingSubmissions();
    }
  });
};

export const checkNetworkStatus = () => isOnline;

export const submitPaper = async (paperData) => {
  if (!isOnline) {
    await addPendingSubmission(paperData);
    return { success: false, offline: true };
  }

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const processPendingSubmissions = async () => {
  if (!isOnline) return;

  const pending = await getPendingSubmissions();
  for (const submission of pending) {
    try {
      const result = await submitPaper(JSON.parse(submission.paper_data));
      if (result.success) {
        await removePendingSubmission(submission.id);
      }
    } catch (error) {
      console.error('Failed to process pending submission:', error);
    }
  }
};
