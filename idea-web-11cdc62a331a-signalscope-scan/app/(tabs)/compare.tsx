import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carrier Comparison</Text>
      <Text style={styles.subtext}>Premium feature - Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
