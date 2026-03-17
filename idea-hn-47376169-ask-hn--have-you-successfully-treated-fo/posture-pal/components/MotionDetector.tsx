import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { postureDetector } from '@/lib/motion';

interface MotionDetectorProps {
  exerciseId: string;
  onCalibrationComplete?: () => void;
  onPostureCorrect?: () => void;
}

export function MotionDetector({ exerciseId, onCalibrationComplete, onPostureCorrect }: MotionDetectorProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("Please calibrate your posture");
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
      if (isCalibrating) {
        Gyroscope.getDataAsync().then((gyroscopeData) => {
          postureDetector.addCalibrationSample(accelerometerData, gyroscopeData);
          const progress = Math.min(100, (postureDetector['calibrationData'].length / 100) * 100);
          setCalibrationProgress(progress);

          if (progress >= 100) {
            setIsCalibrating(false);
            setFeedback("Calibration complete. Now perform the exercise.");
            onCalibrationComplete?.();
          }
        });
      } else {
        Gyroscope.getDataAsync().then((gyroscopeData) => {
          const result = postureDetector.detectPosture(accelerometerData, gyroscopeData, exerciseId);
          setIsCorrect(result.isCorrect);
          setAngle(result.angle);
          setFeedback(result.feedback);

          if (result.isCorrect) {
            onPostureCorrect?.();
          }
        });
      }
    });

    return () => {
      accelerometerSubscription.remove();
    };
  }, [isCalibrating, exerciseId]);

  const startCalibration = () => {
    postureDetector.startCalibration();
    setIsCalibrating(true);
    setFeedback("Hold your phone in your ideal posture for 5 seconds...");
    setCalibrationProgress(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posture Detection</Text>

      {isCalibrating ? (
        <View style={styles.calibrationContainer}>
          <Text style={styles.calibrationText}>Calibrating: {Math.round(calibrationProgress)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${calibrationProgress}%` }]} />
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.angle}>Angle: {angle.toFixed(2)}°</Text>
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
});
