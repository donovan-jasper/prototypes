import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { sleepAudioBridge } from '../services/sleepAudioBridge';
import { Ionicons } from '@expo/vector-icons';

const SleepDetectorComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      const status = sleepAudioBridge.getStatus();
      setIsActive(status.isActive);
      setIsSleeping(status.isSleeping);
    };

    // Initial status check
    updateStatus();

    // Set up interval to check status periodically
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleDetection = async () => {
    try {
      if (isActive) {
        await sleepAudioBridge.stopMonitoring();
      } else {
        await sleepAudioBridge.startMonitoring();
      }
      setIsActive(!isActive);
    } catch (error) {
      console.error('Failed to toggle sleep detection:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isActive ? 'Monitoring for sleep...' : 'Sleep detection inactive'}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: {Math.round(confidence)}%
        </Text>
      </View>

      <View style={styles.visualIndicator}>
        <View style={[
          styles.circle,
          {
            backgroundColor: isSleeping ? '#FF6B6B' : '#4ECDC4',
            transform: [{ scale: isSleeping ? 1.2 : 1 }]
          }
        ]} />
        <Text style={styles.stateText}>
          {isSleeping ? 'Sleeping' : 'Awake'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: isActive ? '#FF6B6B' : '#4ECDC4' }
        ]}
        onPress={toggleDetection}
      >
        <Ionicons
          name={isActive ? 'pause' : 'play'}
          size={24}
          color="white"
        />
        <Text style={styles.buttonText}>
          {isActive ? 'Stop Monitoring' : 'Start Monitoring'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: '#636E72',
  },
  visualIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default SleepDetectorComponent;
