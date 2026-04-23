import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, TextInput, Alert, Switch, ScrollView } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';
import { DEFAULT_WEBSOCKET_URL, DEFAULT_API_URL } from '../utils/constants';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(process.env.KUBERNETES_API_URL || DEFAULT_API_URL);
  const [wsEndpoint, setWsEndpoint] = useState(process.env.KUBERNETES_WS_ENDPOINT || DEFAULT_WEBSOCKET_URL);
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
    kubernetesAPI.updateEndpoints(apiEndpoint, wsEndpoint);

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
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Monitoring</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsConfiguring(!isConfiguring)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {isConfiguring && (
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>Configuration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>API Endpoint:</Text>
            <TextInput
              style={styles.input}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="https://your-api-endpoint"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WebSocket Endpoint:</Text>
            <TextInput
              style={styles.input}
              value={wsEndpoint}
              onChangeText={setWsEndpoint}
              placeholder="wss://your-websocket-endpoint"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto Reconnect:</Text>
            <Switch
              value={autoReconnect}
              onValueChange={setAutoReconnect}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveConfig}
          >
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading system metrics...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && (
        <View style={styles.metricsContainer}>
          {renderProgressBar('CPU Usage', cpu, cpuAnim, getStatusColor(cpu))}
          {renderProgressBar('Memory Usage', memory, memoryAnim, getStatusColor(memory))}
          {renderProgressBar('Disk Usage', disk, diskAnim, getStatusColor(disk))}

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Connection Status:</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh Metrics</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 10,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  configContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricContainer: {
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  metricValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;
