import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';
import { Ionicons } from '@expo/vector-icons';

interface MotionDetectorProps {
  exerciseId: string;
  onCalibrationComplete?: () => void;
  onPostureCorrect?: () => void;
  onInitialCalibrationStatusLoaded?: (isCalibrated: boolean) => void;
}

export function MotionDetector({
  exerciseId,
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

  const isMounted = useRef(true);

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
          }
        });
      }
    });

    return () => {
      isMounted.current = false;
      accelerometerSubscription.remove();
    };
  }, [isCalibrating, exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded]);

  const startCalibration = () => {
    postureDetector.startCalibration();
    setIsCalibrating(true);
    setFeedback("Hold your phone steady in your ideal posture for 5 seconds...");
    setCalibrationProgress(0);
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

        {showDebugInfo && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Angle: {angle.toFixed(1)}°</Text>
            <Text style={styles.debugText}>Calibration Offset: {calibrationOffset.toFixed(1)}°</Text>
            <Text style={styles.debugText}>Status: {isCorrect ? 'Correct' : 'Incorrect'}</Text>
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
          <Text style={styles.calibrationInstructions}>
            {isCalibrating ? "Hold your phone steady in your ideal posture." : "Tap 'Start Calibration' to begin."}
          </Text>
          <TouchableOpacity style={styles.calibrateButton} onPress={startCalibration}>
            <Text style={styles.calibrateButtonText}>Start Calibration</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={() => setShowDebugInfo(!showDebugInfo)}
        >
          <Ionicons
            name={showDebugInfo ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
          <Text style={styles.debugToggleText}>
            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  detectionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  postureIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
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
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  debugInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
  },
  calibrationContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  calibrationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  calibrationInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  calibrateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  debugToggleText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
});
