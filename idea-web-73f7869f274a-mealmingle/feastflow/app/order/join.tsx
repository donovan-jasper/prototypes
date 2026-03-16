import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';

export default function JoinOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { orders, fetchOrders, joinOrder } = useContext(OrderContext);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === parseInt(id));
    setOrder(foundOrder);
  }, [orders, id]);

  const handleJoinOrder = async () => {
    if (order) {
      await joinOrder(order.id, name);
      router.push(`/order/${order.id}`);
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Loading order...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Join Order</Text>
      <Text variant="bodyLarge">Restaurant: {order.restaurant}</Text>
      <Text variant="bodyLarge">Deadline: {new Date(order.deadline).toLocaleString()}</Text>
      <TextInput
        label="Your Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleJoinOrder}
        disabled={!name}
        style={styles.button}
      >
        Join Order
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
