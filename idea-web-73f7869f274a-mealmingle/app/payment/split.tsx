import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import PaymentSplitView from '../../components/PaymentSplitView';
import { processPayments, confirmPayment } from '../../lib/stripe';
import { useOrder } from '../../hooks/useOrder';
import { usePayment } from '../../hooks/usePayment';

export default function PaymentSplitScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, error } = useOrder(id);
  const { paymentMethods, loading: paymentLoading } = usePayment();
  const [splitType, setSplitType] = useState('equal');
  const [customRules, setCustomRules] = useState([]);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (order && order.splitType) {
      setSplitType(order.splitType);
    }
    if (order && order.customRules) {
      setCustomRules(order.customRules);
    }
  }, [order]);

  const handlePay = async () => {
    if (!paymentMethods || paymentMethods.length === 0) {
      Alert.alert('No payment method', 'Please add a payment method first');
      router.push('/payment/setup');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processPayments(order, splitType, customRules);
      setPaymentIntent(result);

      // For demo purposes, we'll simulate payment confirmation
      // In a real app, you would use Stripe's payment sheet
      const paymentResult = await confirmPayment(
        result.paymentIntent,
        paymentMethods[0].id
      );

      if (paymentResult.status === 'succeeded') {
        Alert.alert('Payment successful', 'Your payment has been processed');
        router.push(`/order/${id}`);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment failed', error.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || paymentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading payment details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading order: {error.message}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PaymentSplitView
        order={order}
        splitType={splitType}
        customRules={customRules}
        onPay={handlePay}
      />
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing payment...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
  },
});
