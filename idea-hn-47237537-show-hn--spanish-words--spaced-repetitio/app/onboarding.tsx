import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { seedDatabase } from '../lib/database';
import { requestNotificationPermissions } from '../lib/notifications';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const [step, setStep] = useState(1);

  const handleStartLearning = async () => {
    // Request notification permissions
    const granted = await requestNotificationPermissions();
    updateSettings({ notificationsEnabled: granted });

    // Seed database with vocabulary
    await seedDatabase();

    // Navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Image
            source={require('../assets/images/onboarding-1.png')}
            style={styles.image}
          />
          <Text style={styles.title}>Welcome to VocaVault</Text>
          <Text style={styles.subtitle}>
            Master the 1,000 most useful words in any language—in weeks, not years.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <Image
            source={require('../assets/images/onboarding-2.png')}
            style={styles.image}
          />
          <Text style={styles.title}>Smart Learning</Text>
          <Text style={styles.subtitle}>
            Our app uses spaced repetition to optimize your learning. Just 5 minutes a day!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartLearning}
          >
            <Text style={styles.buttonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E40AF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
