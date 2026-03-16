import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CheckInReminder = ({ nextCheckIn, onMarkComplete }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Next Check-In</Text>
      <Text style={styles.date}>{nextCheckIn}</Text>
      <Button title="Mark as Complete" onPress={onMarkComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default CheckInReminder;
