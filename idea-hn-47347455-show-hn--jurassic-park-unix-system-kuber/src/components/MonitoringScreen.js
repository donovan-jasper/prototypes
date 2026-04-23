import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, TextInput, Alert, Switch, ScrollView } from 'react-native';
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
          <Animated.View
            style={[
              styles.progressBar,
              {
                width,
                backgroundColor: color,
              },
            ]}
          />
          <Text style={styles.metricValue}>{value}%</Text>
        </View>
      </View>
    );
  };

  if (isConfiguring) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>API Configuration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kubernetes API Endpoint</Text>
            <TextInput
              style={styles.input}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="https://your-kubernetes-api.example.com"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WebSocket Endpoint</Text>
            <TextInput
              style={styles.input}
              value={wsEndpoint}
              onChangeText={setWsEndpoint}
              placeholder="wss://your-websocket.example.com"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto Reconnect</Text>
            <Switch
              value={autoReconnect}
              onValueChange={setAutoReconnect}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveConfig}
            >
              <Text style={styles.buttonText}>Save Configuration</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsConfiguring(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Monitoring</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsConfiguring(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading metrics...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Connection: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsContainer}>
        {renderProgressBar('CPU Usage', cpu, cpuAnim, getStatusColor(cpu))}
        {renderProgressBar('Memory Usage', memory, memoryAnim, getStatusColor(memory))}
        {renderProgressBar('Disk Usage', disk, diskAnim, getStatusColor(disk))}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Good (0-50%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Warning (50-80%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Critical (80-100%)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricContainer: {
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
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
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 16,
    color: '#333',
  },
  configContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;
