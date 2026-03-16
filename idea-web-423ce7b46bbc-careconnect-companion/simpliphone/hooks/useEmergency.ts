import { useState, useEffect } from 'react';
import { getEmergencyContacts } from '../database/contacts';
import { triggerEmergencyCall, sendEmergencySMS, detectShakeGesture } from '../services/emergency';

export const useEmergency = () => {
  const [emergencyContact, setEmergencyContact] = useState(null);

  useEffect(() => {
    const loadEmergencyContact = async () => {
      const contacts = await getEmergencyContacts();
      if (contacts.length > 0) {
        setEmergencyContact(contacts[0]);
      }
    };
    loadEmergencyContact();
  }, []);

  const handleEmergency = async () => {
    if (emergencyContact) {
      await triggerEmergencyCall(emergencyContact.phone);
      await sendEmergencySMS(emergencyContact.phone, 'Emergency! Please call me.');
    }
  };

  useEffect(() => {
    const subscription = detectShakeGesture(handleEmergency);
    return () => subscription.remove();
  }, [emergencyContact]);

  return {
    emergencyContact,
    triggerEmergency: handleEmergency,
  };
};
