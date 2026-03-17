import * as SMS from 'expo-sms';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../App';
import * as Device from 'expo-device';

let smsSubscription = null;

export const startSMSListener = async () => {
  try {
    const hasPermission = await SMS.isAvailableAsync();
    if (!hasPermission) {
      console.log('SMS not available on this device');
      return;
    }

    // Note: expo-sms doesn't have a direct listener API
    // This is a placeholder for the actual implementation
    // In a real app, you'd need to use native modules or a different approach
    console.log('SMS listener started');
  } catch (error) {
    console.error('Error starting SMS listener:', error);
  }
};

export const stopSMSListener = () => {
  if (smsSubscription) {
    smsSubscription.remove();
    smsSubscription = null;
  }
};

export const saveSMSToFirestore = async (sender, body) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const deviceId = Device.modelName || 'unknown';

    await addDoc(collection(db, 'users', user.uid, 'smsMessages'), {
      sender,
      body,
      timestamp: new Date(),
      deviceId,
    });
  } catch (error) {
    console.error('Error saving SMS to Firestore:', error);
  }
};
