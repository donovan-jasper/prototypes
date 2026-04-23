import { useContext, useCallback } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { triggerEmergencyCall, sendEmergencySMS } from '../services/emergency';
import * as Location from 'expo-location';

export const useEmergency = () => {
  const { emergencyContact } = useContext(SettingsContext);

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }, []);

  const triggerEmergencyCall = useCallback(async () => {
    if (!emergencyContact?.phone) {
      throw new Error('No emergency contact configured');
    }
    await triggerEmergencyCall(emergencyContact.phone);
  }, [emergencyContact]);

  const sendEmergencySMS = useCallback(async (location: any) => {
    if (!emergencyContact?.phone) {
      throw new Error('No emergency contact configured');
    }

    let message = 'EMERGENCY ALERT! I need help.';
    if (location) {
      message += `\n\nMy current location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    }

    await sendEmergencySMS(emergencyContact.phone, message);
  }, [emergencyContact]);

  return {
    emergencyContact,
    triggerEmergencyCall,
    sendEmergencySMS,
    getCurrentLocation,
  };
};
