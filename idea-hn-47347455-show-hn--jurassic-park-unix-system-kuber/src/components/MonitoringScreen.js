import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { kubernetesAPI } from '../services/KubernetesAPI';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(process.env.KUBERNETES_API_URL || 'https://your-kubernetes-api-endpoint');
  const [wsEndpoint, setWsEndpoint] = useState(process.env.KUBERNETES_WS_ENDPOINT || 'ws://your-kubernetes-ws-endpoint');
  const [isConfiguring, setIsConfiguring] = useState(false);

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
      wsEndpoint,
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
  }, [wsEndpoint]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Monitoring</Text>

      {isConfiguring ? (
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>Configuration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kubernetes API Endpoint:</Text>
            <TextInput
              style={styles.input}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="https://your-kubernetes-api-endpoint"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WebSocket Endpoint:</Text>
            <TextInput
              style={styles.input}
              value={wsEndpoint}
              onChangeText={setWsEndpoint}
              placeholder="ws://your-kubernetes-ws-endpoint"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveConfig}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsConfiguring(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => setIsConfiguring(true)}
          >
            <Text style={styles.configButtonText}>Configure Endpoints</Text>
          </TouchableOpacity>

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
        </>
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
    color: '#333',
    textAlign: 'center',
  },
  configButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'flex-end',
  },
  configButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  configContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
  refreshButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  metricsContainer: {
    marginTop: 20,
  },
  metric: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
});

export default MonitoringScreen;
