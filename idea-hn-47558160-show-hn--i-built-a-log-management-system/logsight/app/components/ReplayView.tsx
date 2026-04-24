import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ReplayView = ({ log }) => {
  const handleReplay = () => {
    // Logic to replay the log
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Replay Log</Text>
      <Text style={styles.message}>{log.message}</Text>
      <Button title="Replay" onPress={handleReplay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginVertical: 10,
  },
});

export default ReplayView;
