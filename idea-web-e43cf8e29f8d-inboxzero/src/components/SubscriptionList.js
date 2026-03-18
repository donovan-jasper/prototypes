import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import UnsubscribeButton from './UnsubscribeButton';

const SubscriptionList = ({ subscriptions, onRefresh }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, styles[`badge${item.category}`]]}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>
      {item.source ? <Text style={styles.source}>{item.source}</Text> : null}
      <View style={styles.footer}>
        {item.cost > 0 ? (
          <Text style={styles.cost}>${item.cost.toFixed(2)}/mo</Text>
        ) : (
          <Text style={styles.free}>Free</Text>
        )}
        <UnsubscribeButton subscription={item} onComplete={onRefresh} />
      </View>
    </View>
  );

  if (subscriptions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No subscriptions yet</Text>
        <Text style={styles.emptySubtext}>Tap + to add your first subscription</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={subscriptions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeemail: {
    backgroundColor: '#E3F2FD',
  },
  badgesocial: {
    backgroundColor: '#F3E5F5',
  },
  badgenewsletter: {
    backgroundColor: '#E8F5E9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  source: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  free: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#bbb',
  },
});

export default SubscriptionList;
