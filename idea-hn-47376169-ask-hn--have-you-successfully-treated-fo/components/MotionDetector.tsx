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
          const progress = Math.min(100, (postureDetector['calibrationData'].length / 100) * 100);
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
  }, [isCalibrating, exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded, requiredDuration, onExerciseComplete, updateActiveRoutine]);

  const playSound = async (type: 'correct' | 'complete' | 'error' | 'next') => {
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
        case 'complete':
          source = require('../../assets/sounds/complete.mp3');
          break;
        case 'error':
          source = require('../../assets/sounds/error.mp3');
          break;
        case 'next':
          source = require('../../assets/sounds/next.mp3');
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

  const startCalibration = () => {
    postureDetector.startCalibration();
    setIsCalibrating(true);
    setFeedback("Hold your phone in your starting position for 5 seconds...");
    setCalibrationProgress(0);
  };

  if (!isDetectorReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing posture detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.angleIndicatorContainer}>
        <View style={styles.angleIndicator}>
          <View style={styles.anglePointer} />
          <View style={[styles.anglePointer, { transform: [{ rotate: `${angle}deg` }] }]} />
        </View>
        <View style={styles.targetZone}>
          <View style={styles.targetZoneInner} />
        </View>
        {isCorrect && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          </View>
        )}
      </View>

      <Text style={styles.feedbackText}>{feedback}</Text>

      {isCalibrating ? (
        <View style={styles.calibrationContainer}>
          <Text style={styles.calibrationText}>Calibration Progress: {Math.round(calibrationProgress)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${calibrationProgress}%` }]} />
          </View>
        </View>
      ) : (
        <View style={styles.holdProgressContainer}>
          <Text style={styles.holdText}>
            Hold: {Math.round((holdDuration / requiredDuration) * 100)}%
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(holdDuration / requiredDuration) * 100}%` }]} />
          </View>
        </View>
      )}

      {!postureDetector.getIsCalibrated() && (
        <TouchableOpacity style={styles.calibrateButton} onPress={startCalibration}>
          <Text style={styles.calibrateButtonText}>Calibrate Posture</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.debugToggle} onPress={() => setShowDebugInfo(!showDebugInfo)}>
        <Text style={styles.debugToggleText}>{showDebugInfo ? 'Hide' : 'Show'} Debug Info</Text>
      </TouchableOpacity>

      {showDebugInfo && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Angle: {angle.toFixed(1)}°</Text>
          <Text style={styles.debugText}>Calibration Offset: {calibrationOffset.toFixed(1)}°</Text>
          <Text style={styles.debugText}>Hold Duration: {holdDuration}ms</Text>
          <Text style={styles.debugText}>Required Duration: {requiredDuration}ms</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  angleIndicatorContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    position: 'relative',
  },
  angleIndicator: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  anglePointer: {
    position: 'absolute',
    width: 2,
    height: '50%',
    backgroundColor: '#007AFF',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -1 }, { translateY: -50 }],
  },
  targetZone: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  targetZoneInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  feedbackText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  calibrationContainer: {
    width: '100%',
    marginBottom: 20,
  },
  calibrationText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  holdProgressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  holdText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  calibrateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  debugToggle: {
    marginTop: 20,
    padding: 10,
  },
  debugToggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
