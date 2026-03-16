import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { useEmergency } from '../hooks/useEmergency';

export default function EmergencyScreen() {
  const { theme } = useContext(SettingsContext);
  const { emergencyContact, triggerEmergency } = useEmergency();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      triggerEmergency();
    }
  }, [countdown]);

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
        onPress={() => console.log('Emergency cancelled')}
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
  },
  countdown: {
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 40,
  },
  cancelButton: {
    padding: 20,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
