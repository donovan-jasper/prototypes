import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PrivacyDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Dashboard</Text>

      <View style={styles.stat}>
        <Text style={styles.statLabel}>Data Processed:</Text>
        <Text style={styles.statValue}>1.2 GB</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.statLabel}>Files Organized:</Text>
        <Text style={styles.statValue}>423</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.statLabel}>Battery Impact:</Text>
        <Text style={styles.statValue}>3.5%</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.statLabel}>Storage Saved:</Text>
        <Text style={styles.statValue}>500 MB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
