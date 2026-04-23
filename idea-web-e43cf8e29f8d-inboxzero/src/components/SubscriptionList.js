import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { unsubscribe } from '../services/SubscriptionService';

const SubscriptionList = ({ subscriptions, onRefresh }) => {
  const handleUnsubscribe = async (id) => {
    Alert.alert(
      'Confirm Unsubscribe',
      'Are you sure you want to unsubscribe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unsubscribe',
          onPress: async () => {
            try {
              await unsubscribe(id);
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Failed to unsubscribe:', error);
              Alert.alert('Error', 'Failed to unsubscribe. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.subscriptionItem}>
      <View style={styles.subscriptionInfo}>
        <Text style={styles.subscriptionName}>{item.name}</Text>
        <Text style={styles.subscriptionSource}>{item.source}</Text>
        {item.cost > 0 && (
          <Text style={styles.subscriptionCost}>${item.cost.toFixed(2)} {item.billing_cycle}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.unsubscribeButton}
        onPress={() => handleUnsubscribe(item.id)}
      >
        <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={subscriptions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active subscriptions</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  subscriptionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subscriptionSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subscriptionCost: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  unsubscribeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unsubscribeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SubscriptionList;
