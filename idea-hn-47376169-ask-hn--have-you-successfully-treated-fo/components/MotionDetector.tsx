import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';

interface MotionDetectorProps {
  exerciseId: string;
  onCalibrationComplete?: () => void;
  onPostureCorrect?: () => void;
  // New prop to inform parent about initial calibration status
  onInitialCalibrationStatusLoaded?: (isCalibrated: boolean) => void;
}

export function MotionDetector({ exerciseId, onCalibrationComplete, onPostureCorrect, onInitialCalibrationStatusLoaded }: MotionDetectorProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("Loading calibration...");
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [isDetectorReady, setIsDetectorReady] = useState(false); // Indicates if calibration data is loaded/available

  const isMounted = useRef(true); // To prevent state updates on unmounted component

  useEffect(() => {
    isMounted.current = true;
    const loadAndSetCalibration = async () => {
      await postureDetector.loadCalibrationData();
      if (isMounted.current) {
        setCalibrationOffset(postureDetector.calibrationOffset);
        const calibrated = postureDetector.getIsCalibrated();
        onInitialCalibrationStatusLoaded?.(calibrated); // Inform parent
        if (calibrated) {
          setIsDetectorReady(true);
          setFeedback("Ready for exercise.");
        } else {
          setIsDetectorReady(true); // Still ready, but needs calibration
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
            postureDetector.saveCalibrationData(); // Save after successful calibration
            onCalibrationComplete?.();
          }
        });
      } else if (postureDetector.getIsCalibrated()) { // Only detect if calibrated
        Gyroscope.getDataAsync().then((gyroscopeData) => {
          if (!isMounted.current) return;
          const result = postureDetector.detectPosture(accelerometerData, gyroscopeData, exerciseId);
          setIsCorrect(result.isCorrect);
          setAngle(result.angle);
          setFeedback(result.feedback);
          setCalibrationOffset(result.calibrationOffset); // Update from detector result

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
    setFeedback("Hold your phone in your ideal posture for 5 seconds...");
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

      {isCalibrating || !postureDetector.getIsCalibrated() ? ( // Show calibration UI if calibrating or not calibrated
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
            <Text style={styles.calibrateButtonText}>{isCalibrating ? "Cancel Calibration" : "Start Calibration"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.angle}>Angle: {angle.toFixed(2)}°</Text>
          <Text style={styles.calibrationOffset}>Calibration Offset: {calibrationOffset.toFixed(2)}°</Text>
          <View style={[styles.indicator, isCorrect ? styles.correct : styles.incorrect]}>
            <Text style={styles.indicatorText}>{feedback}</Text>
          </View>

          <TouchableOpacity style={styles.calibrateButton} onPress={startCalibration}>
            <Text style={styles.calibrateButtonText}>Recalibrate</Text>
          </TouchableOpacity>
        </>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  angle: {
    fontSize: 18,
    marginBottom: 10,
  },
  calibrationOffset: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  indicator: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  correct: {
    backgroundColor: '#34C759',
  },
  incorrect: {
    backgroundColor: '#FF3B30',
  },
  indicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  calibrateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calibrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calibrationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  calibrationInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});
