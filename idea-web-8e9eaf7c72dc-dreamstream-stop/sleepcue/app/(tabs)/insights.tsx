import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PaywallModal from '../../components/PaywallModal';

export default function InsightsScreen() {
  const isPremium = false; // Replace with actual premium check

  if (!isPremium) {
    return <PaywallModal />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Insights</Text>
      <Text>Sleep pattern charts and statistics will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
