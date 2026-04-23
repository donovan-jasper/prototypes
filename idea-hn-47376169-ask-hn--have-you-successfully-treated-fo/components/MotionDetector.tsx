import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';

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
    };
  }, [isCalibrating, exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded, requiredDuration, onExerciseComplete, updateActiveRoutine]);

  const startCalibration = () => {
    postureDetector.startCalibration();
    setIsCalibrating(true);
    setFeedback("Hold your phone steady in your ideal posture for 5 seconds...");
    setCalibrationProgress(0);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  if (!isDetectorReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>Loading Motion Detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.detectionContainer}>
        <View style={[styles.postureIndicator, isCorrect ? styles.correct : styles.incorrect]} />
        <Text style={styles.feedbackText}>{feedback}</Text>

        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Hold Duration:</Text>
          <Text style={styles.durationValue}>{formatDuration(holdDuration)}s</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(holdDuration / requiredDuration) * 100}%` }]} />
          </View>
          <Text style={styles.durationTarget}>{formatDuration(requiredDuration)}s target</Text>
        </View>

        {showDebugInfo && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Angle: {angle.toFixed(1)}°</Text>
            <Text style={styles.debugText}>Calibration Offset: {calibrationOffset.toFixed(1)}°</Text>
            <Text style={styles.debugText}>Status: {isCorrect ? 'Correct' : 'Incorrect'}</Text>
            <Text style={styles.debugText}>Hold Duration: {holdDuration}ms</Text>
          </View>
        )}
      </View>

      {isCalibrating || !postureDetector.getIsCalibrated() ? (
        <View style={styles.calibrationContainer}>
          <Text style={styles.calibrationText}>
            {isCalibrating ? `Calibrating: ${Math.round(calibrationProgress)}%` : "Calibration Required"}
          </Text>
          {isCalibrating && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calibrationProgress}%` }]} />
            </View>
          )}
          {!isCalibrating && !postureDetector.getIsCalibrated() && (
            <TouchableOpacity style={styles.calibrateButton} onPress={startCalibration}>
              <Text style={styles.calibrateButtonText}>Start Calibration</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.debugToggle}
        onPress={() => setShowDebugInfo(!showDebugInfo)}
      >
        <Ionicons name={showDebugInfo ? "eye-off" : "eye"} size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detectionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  postureIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correct: {
    backgroundColor: '#4CAF50',
  },
  incorrect: {
    backgroundColor: '#F44336',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  durationContainer: {
    width: '100%',
    marginTop: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  durationTarget: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  calibrationContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  calibrationText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  calibrateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    width: '100%',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 5,
  },
  debugToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
});
