import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import EmergencyAlert from '@/components/EmergencyAlert';
import CalibrationWizard from '@/components/CalibrationWizard';

const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Alert</Text>
        <EmergencyAlert />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calibration</Text>
        <Link href="/calibration" style={styles.link}>Run Calibration</Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Button title="Export Data" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: 'blue',
    marginVertical: 10,
  },
});

export default SettingsScreen;
