import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSleepDetection } from '../hooks/useSleepDetection';

export default function SleepDetector() {
  const { isSleeping, confidence, startDetection, stopDetection } = useSleepDetection();
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (isSleeping) {
      // Handle sleep detection (pause audio, etc.)
      console.log('Sleep detected! Confidence:', confidence);
    }
  }, [isSleeping, confidence]);

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
    setIsDetecting(!isDetecting);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Detection</Text>
      <Text style={styles.status}>
        Status: {isSleeping ? 'Asleep' : 'Awake'}
      </Text>
      <Text style={styles.confidence}>
        Confidence: {Math.round(confidence * 100)}%
      </Text>
      <Button
        title={isDetecting ? 'Stop Detection' : 'Start Detection'}
        onPress={handleToggleDetection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    marginBottom: 15,
  },
});
