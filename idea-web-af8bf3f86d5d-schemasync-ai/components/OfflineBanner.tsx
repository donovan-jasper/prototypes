import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <MaterialIcons name="signal-wifi-off" size={20} color="#fff" />
      <Text style={styles.text}>Offline Mode - Some features may be limited</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#d32f2f',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});
