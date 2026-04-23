import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { useEmergency } from '../hooks/useEmergency';
import { useRouter } from 'expo-router';

export default function EmergencyScreen() {
  const { theme } = useContext(SettingsContext);
  const { emergencyContact, triggerEmergencyCall, sendEmergencySMS, getCurrentLocation } = useEmergency();
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleEmergencyAction();
    }
  }, [countdown]);

  const handleEmergencyAction = async () => {
    try {
      // Get current location
      const location = await getCurrentLocation();

      // Trigger call
      await triggerEmergencyCall();

      // Send SMS to all emergency contacts
      await sendEmergencySMS(location);

      // Navigate back to home after 5 seconds
      setTimeout(() => {
        router.replace('/');
      }, 5000);
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate emergency actions');
      router.replace('/');
    }
  };

  const handleCancel = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <Text style={[styles.text, { color: theme.colors.onError }]}>
        CALLING {emergencyContact?.name || 'EMERGENCY CONTACT'}
      </Text>
      <Text style={[styles.countdown, { color: theme.colors.onError }]}>
        {countdown}
      </Text>
      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: theme.colors.background }]}
        onPress={handleCancel}
      >
        <Text style={[styles.cancelText, { color: theme.colors.error }]}>CANCEL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  countdown: {
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 40,
  },
  cancelButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 40,
  },
  cancelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
