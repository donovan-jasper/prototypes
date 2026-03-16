import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TimerControl from '../../components/TimerControl';

export default function TimerScreen() {
  const [timerType, setTimerType] = useState<'smart' | 'manual'>('smart');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Timer</Text>
      <View style={styles.toggleContainer}>
        <Text
          style={[styles.toggleText, timerType === 'smart' && styles.activeToggle]}
          onPress={() => setTimerType('smart')}
        >
          Smart Timer
        </Text>
        <Text
          style={[styles.toggleText, timerType === 'manual' && styles.activeToggle]}
          onPress={() => setTimerType('manual')}
        >
          Manual Timer
        </Text>
      </View>
      <TimerControl type={timerType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    marginHorizontal: 10,
    padding: 5,
  },
  activeToggle: {
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
});
