import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BatteryStatsProps {
  savedBattery: number; // in hours
  weeklySavings: number;
  monthlySavings: number;
}

export default function BatteryStats({ savedBattery, weeklySavings, monthlySavings }: BatteryStatsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battery Savings</Text>
      <Text style={styles.savings}>Total saved: {savedBattery.toFixed(1)} hours</Text>
      <Text style={styles.savings}>Weekly: {weeklySavings.toFixed(1)} hours</Text>
      <Text style={styles.savings}>Monthly: {monthlySavings.toFixed(1)} hours</Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>🏆 Battery Saver</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  savings: {
    fontSize: 16,
    marginBottom: 5,
  },
  badgeContainer: {
    marginTop: 15,
  },
  badge: {
    fontSize: 16,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
