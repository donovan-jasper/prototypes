import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import { PaymentContext } from '../../contexts/PaymentContext';
import PaymentSplitView from '../../components/PaymentSplitView';

export default function PaymentSplitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { orders, fetchOrders } = useContext(OrderContext);
  const { processPayment } = useContext(PaymentContext);
  const [order, setOrder] = useState(null);
  const [split, setSplit] = useState(null);

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
      const perPerson = total / order.participants.length;
      setSplit({
        total,
        perPerson,
        participants: order.participants.map(participant => ({
          ...participant,
          amount: perPerson,
        })),
      });
    }
  }, [order]);

  const handlePayNow = async () => {
    if (order) {
      await processPayment(order.id);
      router.push(`/order/${order.id}`);
    }
  };

  if (!order || !split) {
    return (
      <View style={styles.container}>
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
          <PaymentSplitView split={split} />
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={handlePayNow}
          >
            Pay Now
          </Button>
        </Card.Actions>
      </Card>
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
});
