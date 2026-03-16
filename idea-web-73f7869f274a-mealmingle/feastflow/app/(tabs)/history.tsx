import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { OrderContext } from '../../contexts/OrderContext';
import OrderCard from '../../components/OrderCard';

export default function HistoryScreen() {
  const { orders, fetchOrders } = useContext(OrderContext);
  const [pastOrders, setPastOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPastOrders(orders.filter(order => order.status === 'delivered'));
  }, [orders]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Order History</Text>
      <FlatList
        data={pastOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={item => item.id.toString()}
      />
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
});
