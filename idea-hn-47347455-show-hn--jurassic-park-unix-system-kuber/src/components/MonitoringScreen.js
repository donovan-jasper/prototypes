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
  const [retryCount, setRetryCount] = useState(0);
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
        wsEndpoint,
        (metrics) => {
          if (isMounted) {
            setCPU(metrics.cpu);
            setMemory(metrics.memory);
            setDisk(metrics.disk);
            setError(null);
            setIsConnected(true);
            setRetryCount(0);

            // Animate the progress bars
            animateBar(cpuAnim, metrics.cpu);
            animateBar(memoryAnim, metrics.memory);
            animateBar(diskAnim, metrics.disk);
          }
        },
        (error) => {
          if (isMounted) {
            setIsConnected(false);
            if (autoReconnect && retryCount < 5) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                setupWebSocket();
              }, 3000 * (retryCount + 1));
            }
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
  }, [wsEndpoint, autoReconnect, retryCount]);

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

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
          {retryCount > 0 && ` (Retrying ${retryCount}/5)`}
        </Text>
        <Switch
          value={autoReconnect}
          onValueChange={setAutoReconnect}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={autoReconnect ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text style={styles.switchLabel}>Auto-reconnect</Text>
      </View>

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
              placeholder={WEBSOCKET_ENDPOINT}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button} onPress={handleSaveConfig}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsConfiguring(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>CPU Usage</Text>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: cpuAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getStatusColor(cpu),
                      },
                    ]}
                  />
                  <Text style={styles.metricValue}>{cpu}%</Text>
                </View>
              </View>

              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Memory Usage</Text>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: memoryAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getStatusColor(memory),
                      },
                    ]}
                  />
                  <Text style={styles.metricValue}>{memory}%</Text>
                </View>
              </View>

              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Disk Usage</Text>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: diskAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getStatusColor(disk),
                      },
                    ]}
                  />
                  <Text style={styles.metricValue}>{disk}%</Text>
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.button} onPress={handleRefresh}>
                  <Text style={styles.buttonText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setIsConfiguring(true)}>
                  <Text style={styles.buttonText}>Configure</Text>
                </TouchableOpacity>
              </View>
            </>
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
    textAlign: 'center',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 14,
    marginLeft: 5,
  },
  configContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  configTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  progressBarContainer: {
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
    fontSize: 14,
    color: '#333',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MonitoringScreen;
