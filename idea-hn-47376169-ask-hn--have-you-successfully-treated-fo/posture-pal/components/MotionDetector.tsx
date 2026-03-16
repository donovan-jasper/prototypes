import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { detectPosture } from '@/lib/motion';

export function MotionDetector({ exercise }) {
  const [isCorrect, setIsCorrect] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener((data) => {
      const { isCorrect: correct, angle: detectedAngle } = detectPosture(data);
      setIsCorrect(correct);
      setAngle(detectedAngle);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posture Detection</Text>
      <Text style={styles.angle}>Angle: {angle.toFixed(2)}°</Text>
      <View style={[styles.indicator, isCorrect ? styles.correct : styles.incorrect]}>
        <Text style={styles.indicatorText}>
          {isCorrect ? 'Correct Posture' : 'Adjust Your Posture'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  angle: {
    fontSize: 18,
    marginBottom: 10,
  },
  indicator: {
    padding: 15,
    borderRadius: 10,
  },
  correct: {
    backgroundColor: '#34C759',
  },
  incorrect: {
    backgroundColor: '#FF3B30',
  },
  indicatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
