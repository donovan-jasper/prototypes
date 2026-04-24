import { addPendingSubmission, getPendingSubmissions, removePendingSubmission } from './database';
import NetInfo from '@react-native-community/netinfo';
import { submitPaperToServer } from './api';

let networkListeners = [];

export const initNetworkMonitoring = (setIsOnline) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
  });

  return unsubscribe;
};

export const addNetworkListener = (listener) => {
  networkListeners.push(listener);
};

export const checkNetworkStatus = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

export const submitPaper = async (paperData) => {
  const isOnline = await checkNetworkStatus();

  if (!isOnline) {
    await addPendingSubmission(paperData);
    return { success: true, offline: true };
  }

  try {
    const result = await submitPaperToServer(paperData);
    return { success: true, offline: false, data: result };
  } catch (error) {
    console.error('Network submission failed:', error);
    await addPendingSubmission(paperData);
    return { success: false, offline: true };
  }
};

export const processPendingSubmissions = async () => {
  const isOnline = await checkNetworkStatus();
  if (!isOnline) return;

  const pendingSubmissions = await getPendingSubmissions();

  for (const submission of pendingSubmissions) {
    try {
      const paperData = JSON.parse(submission.paper_data);
      const result = await submitPaperToServer(paperData);

      if (result.success) {
        await removePendingSubmission(submission.id);
      }
    } catch (error) {
      console.error('Failed to process pending submission:', error);
    }
  }
};
