import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { motionTracker } from '@/lib/sensors/motionDetector';
import { analyzeSound } from '@/lib/sensors/soundAnalyzer';
import { measureLight } from '@/lib/sensors/lightSensor';
import { classifySleepState } from '@/lib/ml/sleepClassifier';

const MonitorScreen = () => {
  const [sleepState, setSleepState] = useState('awake');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [bufferStatus, setBufferStatus] = useState({ percentFull: 0, dataPoints: 0 });
  const { setSleepDetected } = useAppStore();

  useEffect(() => {
    if (isMonitoring) {
      motionTracker.startMotionTracking();

      const interval = setInterval(async () => {
        const motionState = motionTracker.getCurrentStillnessState();
        const sound = await analyzeSound();
        const light = await measureLight();

        const state = classifySleepState({ 
          motion: motionState.isStill ? 0.01 : 0.5, 
          sound, 
          light 
        });
        
        setSleepState(state);
        setBufferStatus({
          percentFull: motionTracker.getBufferStatus().percentFull,
          dataPoints: motionState.dataPoints
        });

        if (state === 'asleep') {
          setSleepDetected(true);
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        motionTracker.stopMotionTracking();
      };
    }
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Status</Text>
      
      <View style={[styles.statusIndicator, styles[sleepState]]}>
        <Text style={styles.statusText}>{sleepState.toUpperCase()}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Buffer: {bufferStatus.percentFull.toFixed(1)}% full
        </Text>
        <Text style={styles.infoText}>
          Data points: {bufferStatus.dataPoints}
        </Text>
        <Text style={styles.infoText}>
          Status: {isMonitoring ? 'Monitoring' : 'Stopped'}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isMonitoring ? styles.stopButton : styles.startButton]}
        onPress={toggleMonitoring}
      >
        <Text style={styles.buttonText}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  awake: {
    backgroundColor: '#4CAF50',
  },
  drowsy: {
    backgroundColor: '#FFC107',
  },
  asleep: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MonitorScreen;
