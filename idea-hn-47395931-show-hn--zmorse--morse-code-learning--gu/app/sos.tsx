import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import PremiumGate from '../components/PremiumGate';

export default function SOSScreen() {
  const [active, setActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isPremium, setIsPremium] = useState(false);
  const [customMessage, setCustomMessage] = useState('SOS');

  useEffect(() => {
    // Check premium status in production
    // For demo, we'll simulate it
    setIsPremium(false);
  }, []);

  const flashSOS = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed to use flashlight');
        return;
      }
    }

    setActive(true);

    try {
      // SOS pattern: ... --- ...
      const pattern = [100, 100, 100, 100, 100, 300, 300, 300, 300, 300, 300, 100, 100, 100, 100, 100];

      for (const duration of pattern) {
        // Toggle flashlight
        // In a real app, you would use expo-camera's torch mode
        await Haptics.impactAsync(
          duration > 200 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
        );
        await new Promise(resolve => setTimeout(resolve, duration));
      }
    } finally {
      setActive(false);
    }
  };

  const handleCustomMessage = () => {
    if (!isPremium) {
      return;
    }
    // In a real app, this would open a modal to set custom message
    Alert.alert('Custom Message', 'Premium feature: Set your custom SOS message');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.warning}>⚠️ Use only in real emergencies</Text>

      <Button
        title={active ? "Signaling..." : "Send SOS"}
        onPress={flashSOS}
        disabled={active}
        color="#FF3B30"
      />

      <PremiumGate
        isPremium={isPremium}
        featureName="Custom SOS Messages"
        onUpgrade={() => setIsPremium(true)}
      />

      <Text style={styles.info}>
        This will flash SOS in Morse code using your device's flashlight.
      </Text>

      {isPremium && (
        <View style={styles.premiumSection}>
          <Text style={styles.premiumText}>Current Message: {customMessage}</Text>
          <Button
            title="Set Custom Message"
            onPress={handleCustomMessage}
            color="#007AFF"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warning: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 40,
  },
  info: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
  premiumSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#007AFF',
  },
});
