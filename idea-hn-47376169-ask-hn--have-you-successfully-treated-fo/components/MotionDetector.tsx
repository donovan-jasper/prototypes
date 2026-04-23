import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';

interface MotionDetectorProps {
  exerciseId: string;
  onCalibrationComplete?: () => void;
  onPostureCorrect?: () => void;
  onInitialCalibrationStatusLoaded?: (isCalibrated: boolean) => void;
}

export function MotionDetector({ exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded }: MotionDetectorProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("Loading calibration...");
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [isDetectorReady, setIsDetectorReady] = useState(false);

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
      <Text style={styles.title}>Posture Detection</Text>

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
        <View style={styles.detectionContainer}>
          <View style={[styles.postureIndicator, isCorrect ? styles.correct : styles.incorrect]} />
          <Text style={styles.angleText}>Angle: {angle.toFixed(1)}°</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
          <Text style={styles.offsetText}>Calibration Offset: {calibrationOffset.toFixed(1)}°</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  calibrationContainer: {
    alignItems: 'center',
    width: '100%',
  },
  calibrationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  calibrationInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  calibrateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  calibrateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detectionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  postureIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  correct: {
    backgroundColor: '#4CAF50',
  },
  incorrect: {
    backgroundColor: '#F44336',
  },
  angleText: {
    fontSize: 16,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  offsetText: {
    fontSize: 12,
    color: '#666',
  },
});
