import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const OTPList = ({ otps }) => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.timeRemaining}>{item.timeRemaining}s</Text>
      </View>
      <Text style={styles.otpCode}>{item.code}</Text>
    </View>
  );

  return (
    <FlatList
      data={otps}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeRemaining: {
    fontSize: 14,
    color: '#666',
  },
  otpCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default OTPList;
