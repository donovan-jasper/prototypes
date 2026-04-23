import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { sleepDetector } from '../services/sleepDetection';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { usePremium } from '../hooks/usePremium';

interface SleepDetectorProps {
  onSleepDetected?: () => void;
  onWakeDetected?: () => void;
}

export const SleepDetector: React.FC<SleepDetectorProps> = ({ onSleepDetected, onWakeDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [sleepState, setSleepState] = useState({
    isSleeping: false,
    confidence: 0,
    lastUpdated: new Date()
  });
  const [error, setError] = useState<string | null>(null);
  const { isPremium } = usePremium();
  const { pausePlayback, resumePlayback } = useAudioPlayback();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = sleepDetector.getCurrentState();
      setSleepState(currentState);

      if (currentState.isSleeping && !sleepState.isSleeping) {
        onSleepDetected?.();
        pausePlayback();
      } else if (!currentState.isSleeping && sleepState.isSleeping) {
        onWakeDetected?.();
        resumePlayback();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepState.isSleeping, onSleepDetected, onWakeDetected, pausePlayback, resumePlayback]);

  const handleStartDetection = async () => {
    try {
      setError(null);
      setIsDetecting(true);
      await sleepDetector.startDetection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sleep detection');
      setIsDetecting(false);
    }
  };

  const handleStopDetection = async () => {
    try {
      await sleepDetector.stopDetection();
      setIsDetecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop sleep detection');
    }
  };

  const getStatusText = () => {
    if (!isPremium) {
      return 'Upgrade to premium for unlimited sleep detection';
    }
    if (error) {
      return `Error: ${error}`;
    }
    if (isDetecting) {
      return sleepState.isSleeping
        ? `Sleep detected (${sleepState.confidence}% confidence)`
        : 'Monitoring for sleep...';
    }
    return 'Sleep detection paused';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Detection</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {isDetecting && <ActivityIndicator size="small" color="#4CAF50" />}
      </View>

      {isDetecting ? (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={handleStopDetection}
          disabled={!isPremium}
        >
          <Text style={styles.buttonText}>Stop Detection</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={handleStartDetection}
          disabled={!isPremium}
        >
          <Text style={styles.buttonText}>Start Detection</Text>
        </TouchableOpacity>
      )}

      {!isPremium && (
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  upgradeButton: {
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 5,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
