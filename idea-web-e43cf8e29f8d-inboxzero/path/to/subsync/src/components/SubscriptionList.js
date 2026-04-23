import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import UnsubscribeButton from './UnsubscribeButton';

const SubscriptionList = ({ subscriptions, unsubscribe }) => {
  return (
    <FlatList
      data={subscriptions}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.source && <Text style={styles.itemSource}>{item.source}</Text>}
          </View>
          <UnsubscribeButton
            onPress={() => unsubscribe(item.id)}
            style={styles.unsubscribeButton}
          />
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemSource: {
    fontSize: 14,
    color: '#666',
  },
  unsubscribeButton: {
    marginLeft: 10,
  },
});

export default SubscriptionList;
