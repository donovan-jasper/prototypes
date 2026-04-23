import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchOrders, updateOrderPaymentStatus } from '../../lib/database';
import { usePayment } from '../../hooks/usePayment';
import PaymentSplitView from '../../components/PaymentSplitView';
import DeliveryMap from '../../components/DeliveryMap';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { processPayment, confirmPayment } = usePayment();

  useEffect(() => {
    const loadOrder = () => {
      fetchOrders((orders) => {
        const foundOrder = orders.find(o => o.id === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          Alert.alert('Error', 'Order not found');
          router.back();
        }
        setLoading(false);
      });
    };

    loadOrder();

    // Set up polling for real-time updates
    const interval = setInterval(loadOrder, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const handleFinalizeOrder = async () => {
    try {
      setLoading(true);
      // In a real app, you would calculate the split based on actual items
      const mockSplit = {
        total: 25.00,
        perPerson: 12.50,
        participants: [
          { id: 1, name: 'Alice', amount: 12.50, paymentStatus: 'pending' },
          { id: 2, name: 'Bob', amount: 12.50, paymentStatus: 'pending' },
        ],
      };

      // Process the payment
      const paymentResult = await processPayment({
        id: order.id,
        participants: mockSplit.participants,
      });

      // Confirm the payment
      const paymentIntent = await confirmPayment(
        paymentResult.paymentIntent,
        'pm_card_visa' // In a real app, use the actual payment method ID
      );

      if (paymentIntent.status === 'succeeded') {
        updateOrderPaymentStatus(order.id, 'completed', () => {
          setOrder(prev => ({ ...prev, paymentStatus: 'completed' }));
          Alert.alert('Success', 'Order finalized and payment processed');
        });
      } else {
        Alert.alert('Error', 'Payment failed');
      }
    } catch (err) {
      console.error('Error finalizing order:', err);
      Alert.alert('Error', 'Failed to finalize order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySplit = () => {
    router.push(`/payment/split?orderId=${order.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {order.restaurant}
      </Text>

      <View style={styles.section}>
        <Text variant="titleMedium">Order Details</Text>
        <Text>Deadline: {order.deadline}</Text>
        <Text>Status: {order.status}</Text>
        <Text>Payment Status: {order.paymentStatus}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium">Participants</Text>
        {order.participants.map(participant => (
          <Text key={participant.id}>{participant.name}</Text>
        ))}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium">Items in Cart</Text>
        {order.items.map(item => (
          <Text key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
          </Text>
        ))}
      </View>

      {order.paymentStatus === 'pending' && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleFinalizeOrder}
            loading={loading}
            style={styles.button}
          >
            Finalize Order & Process Payment
          </Button>
        </View>
      )}

      {order.paymentStatus === 'completed' && (
        <>
          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium">Payment Split</Text>
            <PaymentSplitView
              split={{
                total: 25.00,
                perPerson: 12.50,
                participants: [
                  { id: 1, name: 'Alice', amount: 12.50, paymentStatus: 'completed' },
                  { id: 2, name: 'Bob', amount: 12.50, paymentStatus: 'completed' },
                ],
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handlePaySplit}
              style={styles.button}
            >
              View Payment Details
            </Button>
          </View>
        </>
      )}

      {order.status === 'out_for_delivery' && (
        <>
          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium">Delivery Tracking</Text>
            <DeliveryMap driverLocation={order.driverLocation} />
          </View>
        </>
      )}
    </ScrollView>
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
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
});
