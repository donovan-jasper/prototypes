import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import CartItemList from '../../components/CartItemList';
import DeliveryMap from '../../components/DeliveryMap';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { orders, fetchOrders } = useContext(OrderContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === parseInt(id));
    setOrder(foundOrder);
  }, [orders, id]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Loading order...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">{order.restaurant}</Text>
          <Text variant="bodyLarge">Status: {order.status}</Text>
          <Text variant="bodyLarge">Deadline: {new Date(order.deadline).toLocaleString()}</Text>
          <Divider style={styles.divider} />
          <Text variant="titleLarge">Participants</Text>
          {order.participants.map((participant, index) => (
            <Text key={index} variant="bodyLarge">{participant.name}</Text>
          ))}
          <Divider style={styles.divider} />
          <Text variant="titleLarge">Shared Cart</Text>
          <CartItemList items={order.items} />
          <Divider style={styles.divider} />
          {order.status === 'out_for_delivery' && (
            <>
              <Text variant="titleLarge">Delivery Tracking</Text>
              <DeliveryMap driverLocation={order.driverLocation} />
            </>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => router.push(`/payment/split/${order.id}`)}
          >
            View Payment Split
          </Button>
          {order.status === 'pending' && (
            <Button
              mode="outlined"
              onPress={() => router.push(`/order/add-item/${order.id}`)}
            >
              Add Item
            </Button>
          )}
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
