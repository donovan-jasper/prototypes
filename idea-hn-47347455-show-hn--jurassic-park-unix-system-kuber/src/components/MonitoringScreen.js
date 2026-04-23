import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation values for progress bars
  const cpuAnim = useRef(new Animated.Value(0)).current;
  const memoryAnim = useRef(new Animated.Value(0)).current;
  const diskAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    let unsubscribe;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const metrics = await kubernetesAPI.fetchMetrics();

        if (isMounted) {
          setCPU(metrics.cpu);
          setMemory(metrics.memory);
          setDisk(metrics.disk);
          setError(null);

          // Animate the progress bars
          animateBar(cpuAnim, metrics.cpu);
          animateBar(memoryAnim, metrics.memory);
          animateBar(diskAnim, metrics.disk);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch metrics. Please check your connection.');
          console.error('Error fetching metrics:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up WebSocket for real-time updates
    unsubscribe = kubernetesAPI.subscribeToMetrics(
      process.env.KUBERNETES_WS_ENDPOINT || 'ws://your-kubernetes-ws-endpoint',
      (metrics) => {
        if (isMounted) {
          setCPU(metrics.cpu);
          setMemory(metrics.memory);
          setDisk(metrics.disk);
          setError(null);

          // Animate the progress bars
          animateBar(cpuAnim, metrics.cpu);
          animateBar(memoryAnim, metrics.memory);
          animateBar(diskAnim, metrics.disk);
        }
      }
    );

    // Set up polling as fallback
    const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds

    // Clean up function
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(intervalId);
    };
  }, []);

  const animateBar = (animRef, toValue) => {
    Animated.timing(animRef, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const metrics = await kubernetesAPI.fetchMetrics();
      setCPU(metrics.cpu);
      setMemory(metrics.memory);
      setDisk(metrics.disk);
      setError(null);

      // Animate the progress bars
      animateBar(cpuAnim, metrics.cpu);
      animateBar(memoryAnim, metrics.memory);
      animateBar(diskAnim, metrics.disk);
    } catch (err) {
      setError('Failed to refresh metrics. Please check your connection.');
      console.error('Error refreshing metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (value) => {
    if (value < 50) return '#4CAF50'; // Green
    if (value < 80) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Monitoring</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !error ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading metrics...</Text>
        </View>
      ) : (
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>CPU Usage:</Text>
            <Text style={[styles.metricValue, { color: getStatusColor(cpu) }]}>{cpu}%</Text>
            <Animated.View style={[styles.progressBar, { width: cpuAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
              <View style={[styles.progressFill, { backgroundColor: getStatusColor(cpu) }]} />
            </Animated.View>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Memory Usage:</Text>
            <Text style={[styles.metricValue, { color: getStatusColor(memory) }]}>{memory}%</Text>
            <Animated.View style={[styles.progressBar, { width: memoryAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
              <View style={[styles.progressFill, { backgroundColor: getStatusColor(memory) }]} />
            </Animated.View>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Disk Usage:</Text>
            <Text style={[styles.metricValue, { color: getStatusColor(disk) }]}>{disk}%</Text>
            <Animated.View style={[styles.progressBar, { width: diskAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
              <View style={[styles.progressFill, { backgroundColor: getStatusColor(disk) }]} />
            </Animated.View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isLoading}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  errorContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  metricsContainer: {
    width: '100%',
    justifyContent: 'space-around',
    height: 300,
  },
  metric: {
    marginBottom: 30,
  },
  metricLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  refreshButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;
