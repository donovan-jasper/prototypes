import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../App';
import { encryptData } from './encryption';
import * as SMS from 'expo-sms';

export const startSMSListener = () => {
  const user = auth.currentUser;
  if (!user) return null;

  let isForwardingEnabled = true;

  // Check forwarding status from Firestore
  const checkForwardingStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        isForwardingEnabled = userDoc.data().smsForwardingEnabled !== false;
      }
    } catch (error) {
      console.error('Error checking forwarding status:', error);
    }
  };

  checkForwardingStatus();

  const handleIncomingSMS = async (message) => {
    if (!isForwardingEnabled) return;

    try {
      // Encrypt the message content
      const encryptedContent = await encryptData(message.body);

      // Store in Firestore
      await addDoc(collection(db, 'users', user.uid, 'smsMessages'), {
        sender: message.sender,
        content: encryptedContent,
        timestamp: serverTimestamp(),
        isEncrypted: true
      });

      console.log('SMS forwarded successfully');
    } catch (error) {
      console.error('Error forwarding SMS:', error);
    }
  };

  // Set up the SMS listener
  const subscription = SMS.addListener(handleIncomingSMS);

  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
};
