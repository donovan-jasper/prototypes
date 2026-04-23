import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, Button, Card, Divider, Chip } from 'react-native-paper';
import { useOrder } from '../../hooks/useOrder';
import CartItemList from '../../components/CartItemList';
import DeliveryMap from '../../components/DeliveryMap';
import { processReimbursement } from '../../lib/stripe';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { order, loading, error, refreshOrder } = useOrder(id);
  const [isProcessingReimbursement, setIsProcessingReimbursement] = useState(false);

  const handleFinalizeOrder = () => {
    router.push(`/payment/split?id=${id}`);
  };

  const handleProcessReimbursement = async () => {
    if (!order || order.status !== 'delivered') {
      Alert.alert('Error', 'Order must be delivered before processing reimbursement');
      return;
    }

    setIsProcessingReimbursement(true);
    try {
      const result = await processReimbursement(order.id);
      Alert.alert('Success', result.message);
      await refreshOrder();
    } catch (error) {
      console.error('Reimbursement error:', error);
      Alert.alert('Error', error.message || 'Failed to process reimbursement');
    } finally {
      setIsProcessingReimbursement(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading order details...</Text>
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

  const isOrganizer = order.participants.some(p => p.isCurrentUser && p.isOrganizer);
  const isDelivered = order.status === 'delivered';
  const isCompleted = order.status === 'completed';

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.orderCard}>
        <Card.Title
          title={order.restaurant}
          subtitle={`Order #${order.id}`}
          right={() => (
            <Chip
              style={styles.statusChip}
              textStyle={styles.statusText}
            >
              {order.status}
            </Chip>
          )}
        />
        <Card.Content>
          <Text style={styles.orderInfo}>Deadline: {new Date(order.deadline).toLocaleString()}</Text>
          <Text style={styles.orderInfo}>Participants: {order.participants.length}</Text>
          <Text style={styles.orderInfo}>Total: ${order.total.toFixed(2)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Items in Cart</Text>
          <CartItemList items={order.items} />

          {isOrganizer && order.status === 'pending' && (
            <Button
              mode="contained"
              onPress={handleFinalizeOrder}
              style={styles.actionButton}
            >
              Finalize Order
            </Button>
          )}

          {isOrganizer && isDelivered && !isCompleted && (
            <Button
              mode="contained"
              onPress={handleProcessReimbursement}
              loading={isProcessingReimbursement}
              disabled={isProcessingReimbursement}
              style={styles.actionButton}
            >
              Process Reimbursement
            </Button>
          )}

          {isCompleted && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>Reimbursements have been processed</Text>
              <Button
                mode="outlined"
                onPress={() => router.push(`/payment/receipt?id=${id}`)}
                style={styles.receiptButton}
              >
                View Receipt
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {order.status === 'out_for_delivery' && (
        <Card style={styles.deliveryCard}>
          <Card.Title title="Delivery Tracking" />
          <Card.Content>
            <DeliveryMap order={order} />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  orderCard: {
    marginBottom: 16,
  },
  orderInfo: {
    marginBottom: 8,
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 16,
  },
  statusChip: {
    backgroundColor: '#e3f2fd',
    marginRight: 8,
  },
  statusText: {
    color: '#1976d2',
  },
  completedContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  completedText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  receiptButton: {
    marginTop: 8,
  },
  deliveryCard: {
    marginTop: 16,
  },
});
