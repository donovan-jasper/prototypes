import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function OrderCard({ order }) {
  const router = useRouter();

  return (
    <Card style={styles.card} onPress={() => router.push(`/order/${order.id}`)}>
      <Card.Content>
        <Text variant="titleLarge">{order.restaurant}</Text>
        <Text variant="bodyMedium">Status: {order.status}</Text>
        <Text variant="bodyMedium">Deadline: {new Date(order.deadline).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
