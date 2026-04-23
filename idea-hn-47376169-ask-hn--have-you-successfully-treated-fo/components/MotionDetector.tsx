import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Audio } from 'expo-av';

interface MotionDetectorProps {
  exerciseId: string;
  requiredDuration: number;
  onExerciseComplete: () => void;
  onCalibrationComplete?: () => void;
  onPostureCorrect?: () => void;
  onInitialCalibrationStatusLoaded?: (isCalibrated: boolean) => void;
}

export function MotionDetector({
  exerciseId,
  requiredDuration,
  onExerciseComplete,
  onCalibrationComplete,
  onPostureCorrect,
  onInitialCalibrationStatusLoaded
}: MotionDetectorProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("Loading calibration...");
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const isMounted = useRef(true);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { updateActiveRoutine } = useStore();

  useEffect(() => {
    isMounted.current = true;
    const loadAndSetCalibration = async () => {
      await postureDetector.loadCalibrationData();
      if (isMounted.current) {
        setCalibrationOffset(postureDetector.calibrationOffset);
        const calibrated = postureDetector.getIsCalibrated();
        onInitialCalibrationStatusLoaded?.(calibrated);
        if (calibrated) {
          setIsDetectorReady(true);
          setFeedback("Ready for exercise.");
        } else {
          setIsDetectorReady(true);
          setFeedback("Please calibrate your posture.");
        }
      }
    };

    loadAndSetCalibration();

    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
      if (!isMounted.current) return;

      if (isCalibrating) {
        Gyroscope.getDataAsync().then((gyroscopeData) => {
          if (!isMounted.current) return;
          postureDetector.addCalibrationSample(accelerometerData, gyroscopeData);
          const progress = Math.min(100, (postureDetector.calibrationData.length / 100) * 100);
          setCalibrationProgress(progress);

          if (progress >= 100) {
            setIsCalibrating(false);
            setFeedback("Calibration complete. Now perform the exercise.");
            setCalibrationOffset(postureDetector.calibrationOffset);
            postureDetector.saveCalibrationData();
            onCalibrationComplete?.();
          }
        });
      } else if (postureDetector.getIsCalibrated()) {
        Gyroscope.getDataAsync().then((gyroscopeData) => {
          if (!isMounted.current) return;
          const result = postureDetector.detectPosture(accelerometerData, gyroscopeData, exerciseId);
          setIsCorrect(result.isCorrect);
          setAngle(result.angle);
          setFeedback(result.feedback);
          setCalibrationOffset(result.calibrationOffset);

          if (result.isCorrect) {
            onPostureCorrect?.();
            if (!isHolding) {
              setIsHolding(true);
              playSound('correct');
              holdTimerRef.current = setInterval(() => {
                setHoldDuration(prev => {
                  const newDuration = prev + 100;
                  if (newDuration >= requiredDuration) {
                    if (holdTimerRef.current) {
                      clearInterval(holdTimerRef.current);
                    }
                    setIsHolding(false);
                    updateActiveRoutine(exerciseId, true);
                    onExerciseComplete();
                    return requiredDuration;
                  }
                  return newDuration;
                });
              }, 100);
            }
          } else {
            if (isHolding && holdTimerRef.current) {
              clearInterval(holdTimerRef.current);
              setIsHolding(false);
              setHoldDuration(0);
            }
          }
        });
      }
    });

    return () => {
      isMounted.current = false;
      accelerometerSubscription.remove();
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [isCalibrating, exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded, requiredDuration, updateActiveRoutine]);

  const playSound = async (type: 'correct' | 'incorrect') => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const soundObject = new Audio.Sound();
      let source;

      switch (type) {
        case 'correct':
          source = require('../../assets/sounds/correct.mp3');
          break;
        case 'incorrect':
          source = require('../../assets/sounds/incorrect.mp3');
          break;
        default:
          return;
      }

      await soundObject.loadAsync(source);
      await soundObject.playAsync();
      setSound(soundObject);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  if (!isDetectorReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing posture detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.feedbackContainer}>
        {isCorrect ? (
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        ) : (
          <Ionicons name="close-circle" size={80} color="#F44336" />
        )}
        <Text style={[styles.feedbackText, isCorrect ? styles.correctText : styles.incorrectText]}>
          {feedback}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Hold: {Math.round(holdDuration / 1000)}s / {requiredDuration / 1000}s
        </Text>
        <View style={styles.holdProgressBar}>
          <View style={[styles.holdProgressFill, { width: `${(holdDuration / requiredDuration) * 100}%` }]} />
        </View>
      </View>

      {showDebugInfo && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Angle: {angle.toFixed(1)}°</Text>
          <Text style={styles.debugText}>Calibration Offset: {calibrationOffset.toFixed(1)}°</Text>
          <Text style={styles.debugText}>Status: {isCorrect ? 'Correct' : 'Incorrect'}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.debugButton} onPress={toggleDebugInfo}>
        <Text style={styles.debugButtonText}>
          {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  feedbackText: {
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  progressContainer: {
    width: '80%',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  holdProgressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  holdProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  debugInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '80%',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  debugButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  debugButtonText: {
    fontSize: 14,
    color: '#333',
  },
});
