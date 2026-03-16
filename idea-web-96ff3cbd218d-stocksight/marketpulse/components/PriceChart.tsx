import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PriceChart = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Price Chart</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PriceChart;
