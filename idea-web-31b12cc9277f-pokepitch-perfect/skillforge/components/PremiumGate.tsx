import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

export default function PremiumGate() {
  const { isPremium, togglePremium } = useStore();

  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock More Features</Text>
      <Text style={styles.description}>
        Upgrade to premium to access all drills, advanced analytics, and custom drill builder.
      </Text>
      <TouchableOpacity style={styles.button} onPress={togglePremium}>
        <Text style={styles.buttonText}>Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#673ab7',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#673ab7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
