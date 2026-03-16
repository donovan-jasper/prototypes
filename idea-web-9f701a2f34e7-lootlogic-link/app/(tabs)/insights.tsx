import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useInventoryStore } from '../../lib/stores/inventoryStore';

const Insights = () => {
  const { totalValue } = useInventoryStore();

  return (
    <View style={styles.container}>
      <Text>Total Portfolio Value: {totalValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default Insights;
