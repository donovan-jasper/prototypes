import { useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { triggerEmergencyCall, sendEmergencySMS, detectShakeGesture } from '../services/emergency';
import { getCurrentLocation } from '../services/location';
import { useRouter } from 'expo-router';

export const useEmergency = () => {
  const { emergencyContact } = useContext(SettingsContext);
  const router = useRouter();

  const handleShakeDetected = () => {
    router.push('/emergency');
  };

  useEffect(() => {
    const subscription = detectShakeGesture(handleShakeDetected);
    return () => subscription.remove();
  }, []);

  const triggerEmergencyCallAction = async () => {
    if (emergencyContact?.phone) {
      await triggerEmergencyCall(emergencyContact.phone);
    }
  };

  const sendEmergencySMSAction = async (location) => {
    if (emergencyContact?.phone) {
      const message = `EMERGENCY! I need help. My location: ${location.coords.latitude},${location.coords.longitude}`;
      await sendEmergencySMS(emergencyContact.phone, message);
    }
  };

  return {
    emergencyContact,
    triggerEmergencyCall: triggerEmergencyCallAction,
    sendEmergencySMS: sendEmergencySMSAction,
    getCurrentLocation,
  };
};
