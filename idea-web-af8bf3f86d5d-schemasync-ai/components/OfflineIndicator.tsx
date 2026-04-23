import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStore } from '../store/network-store';
import { MaterialIcons } from '@expo/vector-icons';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isInitializing } = useNetworkStore();

  if (isInitializing) {
    return null;
  }

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MaterialIcons name="signal-wifi-off" size={16} color="#721c24" />
      <Text style={styles.text}>Offline Mode</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8d7da',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#721c24',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default OfflineIndicator;
