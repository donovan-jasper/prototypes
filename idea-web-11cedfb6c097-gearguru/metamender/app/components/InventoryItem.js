import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InventoryItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.stats}>Attack: {item.attack}</Text>
      <Text style={styles.stats}>Defense: {item.defense}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 16,
  },
});

export default InventoryItem;
