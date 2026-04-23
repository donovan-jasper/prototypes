import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, Button } from 'react-native-paper';
import PaymentSplitView from '../../components/PaymentSplitView';
import { processPayments, confirmPayment } from '../../lib/stripe';
import { useOrder } from '../../hooks/useOrder';
import { usePayment } from '../../hooks/usePayment';
import { updateOrderPaymentStatus } from '../../lib/database';

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
        await updateOrderPaymentStatus(order.id, 'paid', (response) => {
          if (!response.success) {
            throw new Error('Failed to update order status');
          }
        });

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
          // For demo purposes, we'll simulate the transfer
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Update payment status in database
          await updatePaymentStatus(participant.id, order.id, 'paid', (response) => {
            if (!response.success) {
              console.error('Failed to update payment status for participant', participant.id);
            }
          });
        }
      }

      setReimbursementStatus('completed');
    } catch (error) {
      console.error('Reimbursement error:', error);
      setReimbursementStatus('failed');
      throw error;
    }
  };

  const calculateSplit = (order, splitType, customRules) => {
    // Implementation of split calculation
    // This is a simplified version - in a real app, this would be in lib/stripe.ts
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = total * 0.08;
    const tip = total * 0.15;
    const deliveryFee = 5.00;
    const grandTotal = total + tax + tip + deliveryFee;

    if (splitType === 'equal') {
      const perPerson = grandTotal / order.participants.length;
      return {
        total: grandTotal,
        perPerson,
        participants: order.participants.map(participant => ({
          ...participant,
          amount: perPerson,
        })),
      };
    }

    // Add custom split logic here if needed
    return null;
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

      {reimbursementStatus === 'processing' && (
        <View style={styles.reimbursementStatus}>
          <ActivityIndicator size="small" />
          <Text>Processing reimbursements...</Text>
        </View>
      )}

      {reimbursementStatus === 'completed' && (
        <View style={styles.reimbursementStatus}>
          <Text style={styles.successText}>Reimbursements completed successfully</Text>
        </View>
      )}

      {reimbursementStatus === 'failed' && (
        <View style={styles.reimbursementStatus}>
          <Text style={styles.errorText}>Reimbursement processing failed</Text>
          <Button mode="outlined" onPress={() => processReimbursements(order, splitType, customRules)}>
            Retry
          </Button>
        </View>
      )}

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
  reimbursementStatus: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
