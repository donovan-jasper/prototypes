import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { detectStillness } from '@/lib/sensors/motionDetector';
import { analyzeSound } from '@/lib/sensors/soundAnalyzer';
import { measureLight } from '@/lib/sensors/lightSensor';
import { classifySleepState } from '@/lib/ml/sleepClassifier';

const SleepDetector = ({ onSleepDetected }) => {
  const [sleepState, setSleepState] = useState('awake');

  useEffect(() => {
    const interval = setInterval(async () => {
      const motion = await detectStillness();
      const sound = await analyzeSound();
      const light = await measureLight();

      const state = classifySleepState({ motion, sound, light });
      setSleepState(state);

      if (state === 'asleep') {
        onSleepDetected();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Status</Text>
      <View style={[styles.statusIndicator, styles[sleepState]]}>
        <Text style={styles.statusText}>{sleepState.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  awake: {
    backgroundColor: 'green',
  },
  drowsy: {
    backgroundColor: 'yellow',
  },
  asleep: {
    backgroundColor: 'red',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SleepDetector;
