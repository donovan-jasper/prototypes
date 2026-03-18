import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import SignalMeter from '@/components/SignalMeter';
import SpeedTest from '@/components/SpeedTest';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Signal Dashboard</Text>
        <Text style={styles.subtitle}>Real-time network performance</Text>
      </View>
      
      <View style={styles.content}>
        <SignalMeter />
        
        <View style={styles.spacer} />
        
        <SpeedTest />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  spacer: {
    height: 16,
  },
});
