import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '../store/appStore';

const PremiumGate = ({ children }) => {
  const { premium } = useStore();

  if (premium) {
    return children;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.description}>
        Unlock advanced features with a premium subscription.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#673ab7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PremiumGate;
