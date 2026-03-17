import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Text, Card, Divider, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import { PaymentContext } from '../../contexts/PaymentContext';
import PaymentSplitView from '../../components/PaymentSplitView';
import { Stripe } from '@stripe/stripe-react-native';

export default function PaymentSplitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { orders, fetchOrders } = useContext(OrderContext);
  const { processPayment } = useContext(PaymentContext);
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
      const tax = total * 0.08; // Assuming 8% tax
      const tip = total * 0.15; // Assuming 15% tip
      const deliveryFee = 5.00; // Fixed delivery fee
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

  const handlePayNow = async () => {
    if (!order || !split) return;

    setLoading(true);
    try {
      // In a real app, you would:
      // 1. Get the payment method from the user's saved methods
      // 2. Confirm each payment intent with the payment method
      // 3. Handle the payment confirmation responses

      // For this prototype, we'll simulate the payment process
      const result = await processPayment(order);

      if (result.status === 'success') {
        setPaymentStatus('Payment successful!');
        // Update order status in database
        // In a real app, you would navigate to a confirmation screen
        router.push({
          pathname: `/order/${order.id}`,
          params: { paymentStatus: 'success' }
        });
      } else {
        setPaymentStatus('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setSnackbarVisible(true);
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
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={handlePayNow}
            loading={loading}
            disabled={loading}
          >
            Pay Now
          </Button>
        </Card.Actions>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {paymentStatus}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});
