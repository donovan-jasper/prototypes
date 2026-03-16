import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import OrderCard from '../../components/OrderCard';

export default function HomeScreen() {
  const router = useRouter();
  const { orders, fetchOrders } = useContext(OrderContext);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setActiveOrders(orders.filter(order => order.status !== 'delivered'));
  }, [orders]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Active Orders</Text>
      <FlatList
        data={activeOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={item => item.id.toString()}
      />
      <Button
        mode="contained"
        onPress={() => router.push('/order/create')}
        style={styles.button}
      >
        Create New Order
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
  button: {
    marginTop: 16,
  },
});
