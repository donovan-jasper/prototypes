import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SparkScoreDisplay({ score }) {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>Spark Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: 'gray',
  },
});
