import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStore } from '@/store/network-store';

export default function OfflineIndicator() {
  const { isOnline } = useNetworkStore();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Offline Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffcc00',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#333',
    fontWeight: 'bold',
  },
});
