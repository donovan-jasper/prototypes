import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { sleepAudioBridge } from '../services/sleepAudioBridge';
import { Ionicons } from '@expo/vector-icons';

interface SleepDetectorProps {
  onSleepDetected?: () => void;
  onWakeDetected?: () => void;
}

const SleepDetector: React.FC<SleepDetectorProps> = ({ onSleepDetected, onWakeDetected }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [motionConfidence, setMotionConfidence] = useState(0);
  const [audioConfidence, setAudioConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = sleepAudioBridge.getStatus();
      setIsActive(status.isActive);
      setIsSleeping(status.isSleeping);
      setConfidence(status.confidence);

      // Get detailed state from sleepDetector
      const state = sleepAudioBridge.getStatus();
      setMotionConfidence(state.motionConfidence || 0);
      setAudioConfidence(state.audioConfidence || 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleDetection = async () => {
    setIsLoading(true);
    try {
      if (isActive) {
        await sleepAudioBridge.stopMonitoring();
      } else {
        await sleepAudioBridge.startMonitoring();
      }
    } catch (error) {
      console.error('Failed to toggle detection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Sleep Detection</Text>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Overall Confidence:</Text>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
          </View>
          <Text style={styles.confidenceValue}>{Math.round(confidence)}%</Text>
        </View>

        <View style={styles.signalContainer}>
          <View style={styles.signalItem}>
            <Ionicons name="walk-outline" size={24} color="#666" />
            <Text style={styles.signalLabel}>Motion</Text>
            <View style={styles.signalBar}>
              <View style={[styles.signalFill, { width: `${motionConfidence}%` }]} />
            </View>
          </View>

          <View style={styles.signalItem}>
            <Ionicons name="mic-outline" size={24} color="#666" />
            <Text style={styles.signalLabel}>Audio</Text>
            <View style={styles.signalBar}>
              <View style={[styles.signalFill, { width: `${audioConfidence}%` }]} />
            </View>
          </View>
        </View>

        <Text style={styles.statusText}>
          {isSleeping ? 'Sleep detected' : 'Awake'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.toggleButton, isActive ? styles.activeButton : styles.inactiveButton]}
        onPress={toggleDetection}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isActive ? 'Stop Detection' : 'Start Detection'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  signalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  signalItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  signalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  signalBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  signalFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  toggleButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#f44336',
  },
  inactiveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SleepDetector;
