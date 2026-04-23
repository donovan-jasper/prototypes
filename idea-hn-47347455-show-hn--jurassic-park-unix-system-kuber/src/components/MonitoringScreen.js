import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';
import { WEBSOCKET_ENDPOINT } from '../utils/constants';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(process.env.KUBERNETES_API_URL || 'https://your-kubernetes-api-endpoint');
  const [wsEndpoint, setWsEndpoint] = useState(process.env.KUBERNETES_WS_ENDPOINT || WEBSOCKET_ENDPOINT);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);

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
    const setupWebSocket = () => {
      unsubscribe = kubernetesAPI.subscribeToMetrics(
        (metrics) => {
          if (isMounted) {
            setCPU(metrics.cpu);
            setMemory(metrics.memory);
            setDisk(metrics.disk);
            setError(null);
            setIsConnected(true);

            // Animate the progress bars
            animateBar(cpuAnim, metrics.cpu);
            animateBar(memoryAnim, metrics.memory);
            animateBar(diskAnim, metrics.disk);
          }
        },
        (error) => {
          if (isMounted) {
            setIsConnected(false);
            setError('WebSocket connection failed. Using fallback polling.');
          }
        }
      );
    };

    setupWebSocket();

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

  const handleSaveConfig = () => {
    if (!apiEndpoint || !wsEndpoint) {
      Alert.alert('Error', 'Please enter both API and WebSocket endpoints');
      return;
    }

    // Validate URLs
    try {
      new URL(apiEndpoint);
      new URL(wsEndpoint);
    } catch (e) {
      Alert.alert('Error', 'Please enter valid URLs');
      return;
    }

    // Update the API endpoints
    kubernetesAPI.baseURL = apiEndpoint;
    kubernetesAPI.wsEndpoint = wsEndpoint;

    setIsConfiguring(false);
    Alert.alert('Success', 'Configuration saved successfully');
  };

  const getStatusColor = (value) => {
    if (value < 50) return '#4CAF50'; // Green
    if (value < 80) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const renderProgressBar = (label, value, animValue, color) => {
    const width = animValue.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width, backgroundColor: color }]} />
        </View>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Monitoring</Text>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Connection: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Switch
          value={autoReconnect}
          onValueChange={setAutoReconnect}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={autoReconnect ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text style={styles.statusText}>Auto-reconnect</Text>
      </View>

      {renderProgressBar('CPU Usage', cpu, cpuAnim, getStatusColor(cpu))}
      {renderProgressBar('Memory Usage', memory, memoryAnim, getStatusColor(memory))}
      {renderProgressBar('Disk Usage', disk, diskAnim, getStatusColor(disk))}

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.configButton} onPress={() => setIsConfiguring(!isConfiguring)}>
        <Text style={styles.configButtonText}>{isConfiguring ? 'Cancel' : 'Configure Endpoints'}</Text>
      </TouchableOpacity>

      {isConfiguring && (
        <View style={styles.configContainer}>
          <Text style={styles.configLabel}>API Endpoint:</Text>
          <TextInput
            style={styles.configInput}
            value={apiEndpoint}
            onChangeText={setApiEndpoint}
            placeholder="https://your-kubernetes-api-endpoint"
          />

          <Text style={styles.configLabel}>WebSocket Endpoint:</Text>
          <TextInput
            style={styles.configInput}
            value={wsEndpoint}
            onChangeText={setWsEndpoint}
            placeholder="ws://your-websocket-endpoint"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfig}>
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    marginRight: 10,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  metricValue: {
    marginTop: 5,
    textAlign: 'right',
  },
  refreshButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  configButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  configContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  configLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;
