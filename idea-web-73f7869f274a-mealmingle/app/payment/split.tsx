import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, Button } from 'react-native-paper';
import PaymentSplitView from '../../components/PaymentSplitView';
import { processPayments, confirmPayment, calculateSplit } from '../../lib/stripe';
import { useOrder } from '../../hooks/useOrder';
import { usePayment } from '../../hooks/usePayment';
import { updateOrderPaymentStatus, updatePaymentStatus } from '../../lib/database';

export default function PaymentSplitScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, error } = useOrder(id);
  const { paymentMethods, loading: paymentLoading } = usePayment();
  const [splitType, setSplitType] = useState('equal');
  const [customRules, setCustomRules] = useState([]);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reimbursementStatus, setReimbursementStatus] = useState('pending');

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
      // Process organizer payment
      const result = await processPayments(order, splitType, customRules);
      setPaymentIntent(result);

      // Confirm payment
      const paymentResult = await confirmPayment(
        result.paymentIntent,
        paymentMethods[0].id
      );

      if (paymentResult.status === 'succeeded') {
        // Update order status to paid
        await updateOrderPaymentStatus(order.id, 'paid');

        // Process reimbursements
        setReimbursementStatus('processing');
        await processReimbursements(order, splitType, customRules);

        Alert.alert('Payment successful', 'Your payment has been processed and reimbursements are being processed');
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

  const processReimbursements = async (order, splitType, customRules) => {
    try {
      // Calculate split amounts
      const split = calculateSplit(order, splitType, customRules);

      // For each participant, create a transfer to their payment method
      for (const participant of split.participants) {
        if (!participant.isOrganizer) {
          // In a real app, this would call Stripe's transfer API
          // For this prototype, we'll simulate the transfer
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Update payment status in database
          await updatePaymentStatus(participant.id, order.id, 'paid');
        }
      }

      setReimbursementStatus('completed');
    } catch (error) {
      console.error('Reimbursement error:', error);
      setReimbursementStatus('failed');
      throw error;
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
      <Text style={styles.title}>Payment Split</Text>

      <PaymentSplitView
        order={order}
        splitType={splitType}
        customRules={customRules}
        onSplitTypeChange={setSplitType}
        onCustomRulesChange={setCustomRules}
      />

      <Button
        mode="contained"
        onPress={handlePay}
        loading={isProcessing}
        disabled={isProcessing}
        style={styles.payButton}
      >
        Pay ${order.total.toFixed(2)}
      </Button>

      {reimbursementStatus === 'processing' && (
        <View style={styles.reimbursementStatus}>
          <ActivityIndicator size="small" />
          <Text>Processing reimbursements...</Text>
        </View>
      )}

      {reimbursementStatus === 'completed' && (
        <Text style={styles.successText}>Reimbursements completed successfully</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  payButton: {
    marginTop: 24,
  },
  reimbursementStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  successText: {
    color: 'green',
    marginTop: 16,
    fontWeight: 'bold',
  },
});
