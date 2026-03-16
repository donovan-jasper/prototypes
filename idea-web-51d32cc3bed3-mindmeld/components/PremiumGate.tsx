import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../store/user';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { isPremium, setPremium } = useUser();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Upgrade to Premium to unlock {feature}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setPremium(true)}>
        <Text style={styles.buttonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
