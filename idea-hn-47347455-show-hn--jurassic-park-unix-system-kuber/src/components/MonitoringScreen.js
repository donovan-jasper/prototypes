import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, TextInput, Alert, Switch, ScrollView } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';
import { DEFAULT_WEBSOCKET_URL, DEFAULT_API_URL, PRODUCTION_API_URL, PRODUCTION_WEBSOCKET_URL, isProduction } from '../utils/constants';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(isProduction ? PRODUCTION_API_URL : process.env.KUBERNETES_API_URL || DEFAULT_API_URL);
  const [wsEndpoint, setWsEndpoint] = useState(isProduction ? PRODUCTION_WEBSOCKET_URL : process.env.KUBERNETES_WS_ENDPOINT || DEFAULT_WEBSOCKET_URL);
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
          <Text style={styles.metricValue}>{value}%</Text>
        </View>
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

      {isConfiguring ? (
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>API Configuration</Text>
          <TextInput
            style={styles.input}
            placeholder="API Endpoint"
            value={apiEndpoint}
            onChangeText={setApiEndpoint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="WebSocket Endpoint"
            value={wsEndpoint}
            onChangeText={setWsEndpoint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto-reconnect</Text>
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
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EE" />
              <Text style={styles.loadingText}>Loading metrics...</Text>
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
                <Text style={styles.statusText}>
                  Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
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
  configContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 5,
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
    borderRadius: 5,
    marginBottom: 20,
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
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  metricValue: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;
