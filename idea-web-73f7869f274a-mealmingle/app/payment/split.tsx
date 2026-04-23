import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Text, Card, Divider, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import { PaymentContext } from '../../contexts/PaymentContext';
import PaymentSplitView from '../../components/PaymentSplitView';
import { updateOrderPaymentStatus } from '../../lib/database';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

export default function PaymentSplitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { orders, fetchOrders } = useContext(OrderContext);
  const { processPayment, confirmPayment } = useContext(PaymentContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [order, setOrder] = useState(null);
  const [split, setSplit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === parseInt(id));
    setOrder(foundOrder);
  }, [orders, id]);

  useEffect(() => {
    if (order) {
      const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = total * 0.08;
      const tip = total * 0.15;
      const deliveryFee = 5.00;
      const grandTotal = total + tax + tip + deliveryFee;

      const perPerson = grandTotal / order.participants.length;
      setSplit({
        total: grandTotal,
        perPerson,
        participants: order.participants.map(participant => ({
          ...participant,
          amount: perPerson,
        })),
        breakdown: {
          subtotal: total,
          tax,
          tip,
          deliveryFee
        }
      });
    }
  }, [order]);

  const initializePaymentSheet = async () => {
    if (!order || !split) return;

    setLoading(true);
    try {
      const { paymentIntent, ephemeralKey, customer } = await processPayment(order);

      const { error } = await initPaymentSheet({
        merchantDisplayName: "FeastFlow",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: order.participants[0].name,
        }
      });

      if (error) {
        console.error('PaymentSheet initialization error:', error);
        setPaymentStatus('Failed to initialize payment. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentStatus('Payment failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order || !split) return;

    setLoading(true);
    try {
      await initializePaymentSheet();

      const { error } = await presentPaymentSheet();

      if (error) {
        console.error('PaymentSheet presentation error:', error);
        setPaymentStatus('Payment failed. Please try again.');
        setSnackbarVisible(true);
        return;
      }

      // Payment successful
      updateOrderPaymentStatus(order.id, 'paid', (updateResult) => {
        if (updateResult.success) {
          setPaymentStatus('Payment successful! Order marked as paid.');
          setTimeout(() => {
            fetchOrders();
            router.push({
              pathname: `/order/${order.id}`,
              params: { paymentStatus: 'success' }
            });
          }, 2000);
        } else {
          setPaymentStatus('Payment processed but failed to update order status.');
          setSnackbarVisible(true);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('Payment failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (!order || !split) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey="pk_test_your_publishable_key">
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium">Payment Split</Text>
            <Text variant="bodyLarge">Restaurant: {order.restaurant}</Text>
            <Divider style={styles.divider} />
            <Text variant="titleLarge">Order Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text variant="bodyLarge">Subtotal:</Text>
              <Text variant="bodyLarge">${split.breakdown.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text variant="bodyLarge">Tax (8%):</Text>
              <Text variant="bodyLarge">${split.breakdown.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text variant="bodyLarge">Tip (15%):</Text>
              <Text variant="bodyLarge">${split.breakdown.tip.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text variant="bodyLarge">Delivery Fee:</Text>
              <Text variant="bodyLarge">${split.breakdown.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text variant="titleLarge">Total:</Text>
              <Text variant="titleLarge">${split.total.toFixed(2)}</Text>
            </View>
            <Divider style={styles.divider} />
            <Text variant="titleLarge">Per Person: ${split.perPerson.toFixed(2)}</Text>
            <Divider style={styles.divider} />
            <Text variant="titleLarge">Participants</Text>
            <PaymentSplitView split={split} />

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Processing payment...</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handlePayNow}
              style={styles.payButton}
              disabled={loading}
            >
              Pay Now (${split.perPerson.toFixed(2)})
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={5000}
        >
          {paymentStatus}
        </Snackbar>
      </ScrollView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  payButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
