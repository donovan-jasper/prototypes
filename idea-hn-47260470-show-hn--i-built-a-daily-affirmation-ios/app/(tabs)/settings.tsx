import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PremiumBanner from '../../components/PremiumBanner';

const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <PremiumBanner />
      <Text style={styles.section}>Notification Times</Text>
      <Text>Configure your notification preferences here</Text>
    </ScrollView>
  );
};

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
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default SettingsScreen;
