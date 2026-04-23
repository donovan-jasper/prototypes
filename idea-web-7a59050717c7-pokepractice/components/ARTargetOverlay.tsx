import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ARTargetOverlayProps {
  hits: number;
  misses: number;
  timeLeft: number;
  score?: {
    score: number;
    accuracy: number;
    rating: string;
  };
}

export const ARTargetOverlay = ({ hits, misses, timeLeft, score }: ARTargetOverlayProps) => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.timer}>Time: {timeLeft}s</Text>
      <Text style={styles.score}>Hits: {hits} | Misses: {misses}</Text>

      {score && (
        <View style={styles.results}>
          <Text style={styles.resultTitle}>Game Over!</Text>
          <Text style={styles.resultScore}>Score: {score.score}</Text>
          <Text style={styles.resultAccuracy}>Accuracy: {score.accuracy}% ({score.rating})</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  score: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  results: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 20,
    color: 'white',
    marginBottom: 5,
  },
  resultAccuracy: {
    fontSize: 16,
    color: 'white',
  },
});
