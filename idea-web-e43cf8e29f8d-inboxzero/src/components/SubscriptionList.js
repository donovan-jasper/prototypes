import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SubscriptionList = ({ subscriptions, onUnsubscribe, navigation, showRenewalDates = false }) => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => navigation.navigate('EditSubscription', { subscription: item })}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.cost > 0 && (
            <Text style={styles.itemCost}>${item.cost.toFixed(2)}</Text>
          )}
        </View>
        <Text style={styles.itemSource}>{item.source}</Text>
        {showRenewalDates && item.renewal_date && (
          <Text style={styles.itemRenewal}>
            Renews on {new Date(item.renewal_date).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.unsubscribeButton}
        onPress={() => onUnsubscribe(item.id)}
      >
        <MaterialIcons name="delete" size={24} color="#FF3B30" />
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
          <Text style={styles.emptyText}>No subscriptions found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemRenewal: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  unsubscribeButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SubscriptionList;
