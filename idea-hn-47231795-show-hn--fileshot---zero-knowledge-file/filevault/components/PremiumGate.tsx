import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';

const PremiumGate = () => {
  const { showPremiumGate, upgradeToPremium } = useSubscription();

  if (!showPremiumGate) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.description}>
        Unlock unlimited shares, larger file sizes, and more features.
      </Text>
      <View style={styles.benefits}>
        <Text style={styles.benefit}>• Unlimited file shares</Text>
        <Text style={styles.benefit}>• 5GB max file size</Text>
        <Text style={styles.benefit}>• Custom expiration times</Text>
        <Text style={styles.benefit}>• 50GB vault storage</Text>
      </View>
      <Button
        mode="contained"
        onPress={upgradeToPremium}
        style={styles.button}
      >
        Upgrade Now
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  description: {
    marginBottom: 10,
    color: Colors.light.text,
  },
  benefits: {
    marginBottom: 15,
  },
  benefit: {
    marginBottom: 5,
    color: Colors.light.text,
  },
  button: {
    marginTop: 10,
  },
});

export default PremiumGate;
