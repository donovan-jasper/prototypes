import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMockPaymentMethod, saveMockPaymentMethod } from '../../lib/mockStripe';

export default function PaymentSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSetupPayment = async () => {
    setLoading(true);

    try {
      const paymentMethod = createMockPaymentMethod();
      await saveMockPaymentMethod(paymentMethod.id);
      
      await AsyncStorage.setItem('paymentMethodId', paymentMethod.id);

      setSnackbarMessage('Payment method added successfully!');
      setSnackbarVisible(true);

      setTimeout(() => {
        router.push('/(tabs)/profile');
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Failed to add payment method');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Payment Method</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        This is a mock payment setup. In production, you would enter real card details.
      </Text>

      <View style={styles.mockCard}>
        <Text variant="bodyLarge">Mock Card: Visa •••• 4242</Text>
        <Text variant="bodyMedium" style={styles.mockCardSubtext}>
          This simulates a saved payment method
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleSetupPayment}
        disabled={loading}
        style={styles.button}
      >
        {loading ? <ActivityIndicator color="#fff" /> : 'Save Payment Method'}
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    color: '#666',
  },
  mockCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginVertical: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mockCardSubtext: {
    marginTop: 8,
    color: '#666',
  },
  button: {
    marginTop: 16,
  },
});
