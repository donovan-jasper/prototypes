import React, { useContext, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PaymentContext } from '../../contexts/PaymentContext';

export default function PaymentSetupScreen() {
  const router = useRouter();
  const { confirmSetupIntent } = useStripe();
  const { setupPaymentMethod } = useContext(PaymentContext);
  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSetupPayment = async () => {
    if (!cardDetails?.complete) {
      setSnackbarMessage('Please enter complete card details');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would:
      // 1. Create a setup intent on your backend
      // 2. Get the client secret from your backend
      // 3. Use that client secret here

      // For this prototype, we'll simulate the setup process
      const { error, setupIntent } = await confirmSetupIntent({
        clientSecret: 'YOUR_SETUP_INTENT_CLIENT_SECRET', // Replace with actual client secret
      });

      if (error) {
        setSnackbarMessage(error.message);
        setSnackbarVisible(true);
        return;
      }

      // In a real app, you would save the payment method to your backend
      await setupPaymentMethod(setupIntent.paymentMethodId);

      setSnackbarMessage('Payment method added successfully!');
      setSnackbarVisible(true);

      // Navigate back to profile after a short delay
      setTimeout(() => {
        router.push('/(tabs)/profile');
      }, 1500);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Add Payment Method</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Enter your card details to enable payments
      </Text>

      <CardField
        postalCodeEnabled={false}
        onCardChange={cardDetails => setCardDetails(cardDetails)}
        style={styles.cardField}
      />

      <Button
        mode="contained"
        onPress={handleSetupPayment}
        disabled={!cardDetails?.complete || loading}
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
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 30,
  },
  button: {
    marginTop: 16,
  },
});
