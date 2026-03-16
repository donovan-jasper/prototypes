import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { detectStillness } from '@/lib/sensors/motionDetector';
import { analyzeSound } from '@/lib/sensors/soundAnalyzer';
import { measureLight } from '@/lib/sensors/lightSensor';
import { classifySleepState } from '@/lib/ml/sleepClassifier';

const MonitorScreen = () => {
  const [sleepState, setSleepState] = useState('awake');
  const { setSleepDetected } = useAppStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      const motion = await detectStillness();
      const sound = await analyzeSound();
      const light = await measureLight();

      const state = classifySleepState({ motion, sound, light });
      setSleepState(state);

      if (state === 'asleep') {
        setSleepDetected(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Status</Text>
      <View style={[styles.statusIndicator, styles[sleepState]]}>
        <Text style={styles.statusText}>{sleepState.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MonitorScreen;
