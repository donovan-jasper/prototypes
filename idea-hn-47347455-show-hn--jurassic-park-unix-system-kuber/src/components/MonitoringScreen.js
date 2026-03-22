import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const MonitoringScreen = () => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState(0);
  const [disk, setDisk] = useState(0);
  const websocketRef = useRef(null);
  
  // Animation values for progress bars
  const cpuAnim = useRef(new Animated.Value(0)).current;
  const memoryAnim = useRef(new Animated.Value(0)).current;
  const diskAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Establish WebSocket connection
    websocketRef.current = new WebSocket('ws://localhost:8080');

    websocketRef.current.onopen = () => {
      console.log('Connected to monitoring WebSocket');
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data);
        setCPU(metrics.cpu);
        setMemory(metrics.memory);
        setDisk(metrics.disk);
        
        // Animate the progress bars
        animateBar(cpuAnim, metrics.cpu);
        animateBar(memoryAnim, metrics.memory);
        animateBar(diskAnim, metrics.disk);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocketRef.current.onclose = () => {
      console.log('Disconnected from monitoring WebSocket');
    };

    // Clean up function
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const animateBar = (animRef, toValue) => {
    Animated.timing(animRef, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Monitoring</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>CPU Usage:</Text>
          <Text style={styles.metricValue}>{cpu}%</Text>
          <Animated.View style={[styles.progressBar, { width: cpuAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
            <View style={styles.progressFill} />
          </Animated.View>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Memory Usage:</Text>
          <Text style={styles.metricValue}>{memory}%</Text>
          <Animated.View style={[styles.progressBar, { width: memoryAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
            <View style={styles.progressFill} />
          </Animated.View>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Disk Usage:</Text>
          <Text style={styles.metricValue}>{disk}%</Text>
          <Animated.View style={[styles.progressBar, { width: diskAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
            <View style={styles.progressFill} />
          </Animated.View>
        </View>
      </View>
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
    color: '#333',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
});

export default MonitoringScreen;
