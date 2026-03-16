import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useSessionStore } from '../store/useSessionStore';

const SessionTimer = ({ onEndSession }) => {
  const [time, setTime] = useState(0);
  const { attempts } = useSessionStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(time)}</Text>
      <Text style={styles.attempts}>Attempts: {attempts.length}</Text>
      <Button title="End Session" onPress={onEndSession} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  time: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  attempts: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SessionTimer;
