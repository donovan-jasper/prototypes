import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSettings } from '../contexts/SettingsContext';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';

const COUNTDOWN_SECONDS = 3;

export default function EmergencyScreen() {
  const { emergencyContacts } = useSettings();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isCalling, setIsCalling] = useState(false);

  // Get the first emergency contact
  const primaryContact = emergencyContacts[0];

  // Start countdown when component mounts
  useEffect(() => {
    if (!primaryContact) {
      router.back();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          initiateEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [primaryContact]);

  const initiateEmergencyCall = async () => {
    if (!primaryContact) return;

    setIsCalling(true);

    try {
      // Make the phone call
      const phoneNumber = primaryContact.phone.replace(/\D/g, '');
      const url = Platform.OS === 'android'
        ? `tel:${phoneNumber}`
        : `telprompt:${phoneNumber}`;

      await Linking.openURL(url);

      // Send location SMS to all emergency contacts
      await sendLocationSMS();
    } catch (error) {
      console.error('Emergency call failed:', error);
    } finally {
      setIsCalling(false);
    }
  };

  const sendLocationSMS = async () => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create location message
      const locationMessage = `Emergency! My location: https://maps.google.com/?q=${latitude},${longitude}`;

      // Send to all emergency contacts
      const phoneNumbers = emergencyContacts.map(contact =>
        contact.phone.replace(/\D/g, '')
      );

      await SMS.sendSMSAsync(phoneNumbers, locationMessage);
    } catch (error) {
      console.error('Failed to send location SMS:', error);
    }
  };

  const cancelEmergency = () => {
    router.back();
  };

  if (!primaryContact) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No emergency contact set up</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EMERGENCY MODE</Text>
      <Text style={styles.subtitle}>Calling {primaryContact.name}</Text>

      {isCalling ? (
        <Text style={styles.callingText}>Calling...</Text>
      ) : (
        <>
          <Text style={styles.countdownText}>{countdown}</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  callingText: {
    fontSize: 36,
    color: 'white',
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 200,
  },
  cancelButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0000',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
});
