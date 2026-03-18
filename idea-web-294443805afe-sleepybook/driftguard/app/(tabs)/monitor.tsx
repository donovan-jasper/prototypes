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
  const [stillnessState, setStillnessState] = useState({
    calibrating: true,
    secondsCollected: 0,
    secondsNeeded: 120,
    isStill: false,
    confidence: 0
  });
  const { setSleepDetected } = useAppStore();

  useEffect(() => {
    if (isMonitoring) {
      motionTracker.startMotionTracking();

      const interval = setInterval(async () => {
        const motionState = motionTracker.getCurrentStillnessState();
        setStillnessState(motionState);

        // Only classify sleep state if we have enough data
        if (!motionState.calibrating) {
          const sound = await analyzeSound();
          const light = await measureLight();

          const state = classifySleepState({ 
            motion: motionState.isStill ? 0.01 : 0.5, 
            sound, 
            light 
          });
          
          setSleepState(state);

          if (state === 'asleep') {
            setSleepDetected(true);
          }
        } else {
          setSleepState('calibrating');
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
    if (isMonitoring) {
      setSleepState('awake');
      setStillnessState({
        calibrating: true,
        secondsCollected: 0,
        secondsNeeded: 120,
        isStill: false,
        confidence: 0
      });
    }
  };

  const getStatusColor = () => {
    if (sleepState === 'calibrating') return '#9E9E9E';
    if (sleepState === 'asleep') return '#F44336';
    if (sleepState === 'drowsy') return '#FFC107';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (sleepState === 'calibrating') return 'CALIBRATING';
    return sleepState.toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Status</Text>
      
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.infoContainer}>
        {stillnessState.calibrating ? (
          <>
            <Text style={styles.calibratingTitle}>Calibrating...</Text>
            <Text style={styles.calibratingText}>
              Collecting motion data: {stillnessState.secondsCollected}/{stillnessState.secondsNeeded} seconds
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(stillnessState.secondsCollected / stillnessState.secondsNeeded) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.calibratingSubtext}>
              Keep your device still to establish baseline motion patterns
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>
              Motion: {stillnessState.isStill ? 'Still' : 'Active'}
            </Text>
            <Text style={styles.infoText}>
              Confidence: {(stillnessState.confidence * 100).toFixed(1)}%
            </Text>
            <Text style={styles.infoText}>
              Data points: {stillnessState.secondsCollected}s collected
            </Text>
          </>
        )}
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
  calibratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  calibratingText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  calibratingSubtext: {
    fontSize: 14,
    marginTop: 8,
    color: '#999',
    fontStyle: 'italic',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
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
