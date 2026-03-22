import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI'; // Import the new API service

const MonitoringScreen = () => {
  // Initialize state with default values for system metrics
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });

  useEffect(() => {
    // Subscribe to metrics when the component mounts
    // The subscribeToMetrics function returns an unsubscribe function
    const unsubscribe = kubernetesAPI.subscribeToMetrics((metrics) => {
      setSystemMetrics(metrics);
    });

    // Return the unsubscribe function to be called when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Metrics:</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>CPU:</Text>
        <Text style={styles.metricValue}>{systemMetrics.cpu.toFixed(1)}%</Text>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Memory:</Text>
        <Text style={styles.metricValue}>{systemMetrics.memory.toFixed(1)}%</Text>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Disk:</Text>
        <Text style={styles.metricValue}>{systemMetrics.disk.toFixed(1)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222', // Dark background for a retro feel
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f0', // Bright green text for retro monitor effect
    marginBottom: 20,
    textShadowColor: 'rgba(0, 255, 0, 0.75)', // Glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%', // Control width for better layout
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.1)', // Subtle background for metric rows
    borderRadius: 5,
  },
  metricLabel: {
    fontSize: 18,
    color: '#0f0',
    textShadowColor: 'rgba(0, 255, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f0',
    textShadowColor: 'rgba(0, 255, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default MonitoringScreen;
