import * as Clipboard from 'expo-clipboard';
import { saveSleepSession } from './database';

export const triggerAutoSave = async () => {
  try {
    const content = await Clipboard.getStringAsync();
    if (content) {
      const session = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        confidence: 1,
        notes: content,
      };
      await saveSleepSession(session);
      return { saved: true, timestamp: new Date() };
    }
  } catch (error) {
    console.error('Error during auto-save:', error);
    return { saved: false, error };
  }
};
