import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const TimerDisplay = ({ timeLeft }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TimerDisplay;
