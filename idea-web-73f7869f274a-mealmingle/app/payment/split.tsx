import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { usePayment } from '../../hooks/usePayment';
import PaymentSplitView from '../../components/PaymentSplitView';
import { calculateSplit } from '../../lib/stripe';
import { updateOrderPaymentStatus } from '../../lib/database';

export default function PaymentSplitScreen() {
  const { orderId } = useLocalSearchParams();
  const { processPayment, confirmPayment, loading, error } = usePayment();
  const [split, setSplit] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    // In a real app, you would fetch the order details from the database
    // For this example, we'll use mock data
    const mockOrder = {
      id: orderId,
      restaurant: 'Mock Restaurant',
      items: [
        { id: 1, name: 'Burger', price: 10, quantity: 2, participantId: 1 },
        { id: 2, name: 'Fries', price: 3, quantity: 1, participantId: 2 },
      ],
      participants: [
        { id: 1, name: 'Alice', paymentStatus: 'pending' },
        { id: 2, name: 'Bob', paymentStatus: 'pending' },
      ],
    };

    const calculatedSplit = calculateSplit(mockOrder, 'equal');
    setSplit(calculatedSplit);
  }, [orderId]);

  const handlePayNow = async () => {
    try {
      // In a real app, you would use the actual payment method ID from the user's profile
      const mockPaymentMethodId = 'pm_card_visa';

      // Process the payment
      const paymentResult = await processPayment({
        id: orderId,
        participants: split.participants,
      });

      // Confirm the payment
      const paymentIntent = await confirmPayment(
        paymentResult.paymentIntent,
        mockPaymentMethodId
      );

      if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('completed');
        updateOrderPaymentStatus(orderId, 'completed', () => {
          Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
          router.push(`/order/${orderId}`);
        });
      } else {
        setPaymentStatus('failed');
        Alert.alert('Payment Failed', 'There was an issue processing your payment.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'An error occurred while processing your payment.');
    }
  };

  if (!split) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Calculating split...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Payment Split
      </Text>

      <PaymentSplitView split={split} />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handlePayNow}
          loading={loading}
          disabled={loading || paymentStatus === 'completed'}
          style={styles.payButton}
        >
          {paymentStatus === 'completed' ? 'Payment Complete' : 'Pay Now'}
        </Button>
      </View>

      {error && (
        <Text style={styles.errorText} variant="bodyMedium">
          Error: {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
  payButton: {
    paddingVertical: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
});
