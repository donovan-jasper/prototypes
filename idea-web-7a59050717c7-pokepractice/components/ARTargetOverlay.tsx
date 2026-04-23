import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ARTargetOverlayProps {
  hits: number;
  misses: number;
  timeLeft: number;
  score: {
    score: number;
    accuracy: number;
    rating: string;
  } | null;
}

export const ARTargetOverlay: React.FC<ARTargetOverlayProps> = ({
  hits,
  misses,
  timeLeft,
  score
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Hits: {hits}</Text>
        <Text style={styles.statText}>Misses: {misses}</Text>
        <Text style={styles.statText}>Time: {timeLeft}s</Text>
      </View>

      {score && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Score</Text>
          <Text style={styles.scoreValue}>{score.score}</Text>
          <Text style={styles.scoreAccuracy}>Accuracy: {score.accuracy}% ({score.rating})</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  statText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  scoreTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreValue: {
    color: '#4CAF50',
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreAccuracy: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
});
