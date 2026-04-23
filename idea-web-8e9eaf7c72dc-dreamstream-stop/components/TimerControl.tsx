import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioController } from '../services/audioControl';
import { sleepAudioBridge } from '../services/sleepAudioBridge';

interface TimerControlProps {
  initialTime: number; // in seconds
  mode: 'smart' | 'manual';
  onTimeUp: () => void;
}

const TimerControl: React.FC<TimerControlProps> = ({ initialTime, mode, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    // Reset progress animation when time changes
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: timeLeft * 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    } else {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(initialTime);
    }
    setLastInteraction(Date.now());
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(initialTime);
    setLastInteraction(Date.now());
  };

  const addTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds);
    setLastInteraction(Date.now());

    // If timer was paused, resume it
    if (isPaused) {
      setIsPaused(false);
    }
  };

  const handleSmartTimerExtension = () => {
    if (mode === 'smart') {
      // Check if user is still awake (based on motion/audio)
      const status = sleepAudioBridge.getStatus();
      if (!status.isSleeping && status.confidence < 50) {
        // Extend timer by 5 minutes if user is still awake
        addTime(5 * 60);
      }
    }
  };

  // Check for smart timer extension every 30 seconds
  useEffect(() => {
    if (mode === 'smart' && isRunning && !isPaused) {
      const interval = setInterval(() => {
        handleSmartTimerExtension();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mode, isRunning, isPaused]);

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Animated.View style={[
          styles.progressCircle,
          {
            transform: [{
              rotate: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }
        ]} />

        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.modeText}>
          {mode === 'smart' ? 'Smart Timer' : 'Manual Timer'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleTimer}
        >
          <Ionicons
            name={isRunning ? (isPaused ? 'play-outline' : 'pause-outline') : 'play-outline'}
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetTimer}
        >
          <Ionicons name="refresh-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.addTimeButtons}>
        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => addTime(5 * 60)}
        >
          <Text style={styles.addTimeText}>+5 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => addTime(10 * 60)}
        >
          <Text style={styles.addTimeText}>+10 min</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addTimeButton}
          onPress={() => addTime(15 * 60)}
        >
          <Text style={styles.addTimeText}>+15 min</Text>
        </TouchableOpacity>
      </View>

      {mode === 'smart' && (
        <View style={styles.smartFeatures}>
          <Text style={styles.featureText}>
            {isRunning ? 'Smart timer will extend if you\'re still awake' : 'Smart timer active'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerDisplay: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#4CAF50',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  modeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  controlButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  addTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
  },
  addTimeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  addTimeText: {
    fontSize: 14,
    color: '#666',
  },
  smartFeatures: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TimerControl;
