import * as SMS from 'expo-sms';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../App';

export const startSMSListener = async () => {
  try {
    const { status } = await SMS.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('SMS permissions not granted');
      return;
    }

    const subscription = SMS.addListener((event) => {
      if (event.data && event.data.messages) {
        handleIncomingSMS(event.data.messages);
      }
    });

    return () => {
      subscription.remove();
    };
  } catch (error) {
    console.error('Error setting up SMS listener:', error);
  }
};

const handleIncomingSMS = async (messages) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    for (const message of messages) {
      await addDoc(collection(db, 'users', user.uid, 'smsMessages'), {
        sender: message.originatingAddress || 'Unknown',
        body: message.body,
        timestamp: serverTimestamp(),
        isRead: false
      });
    }
  } catch (error) {
    console.error('Error processing incoming SMS:', error);
  }
};
