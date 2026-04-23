import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface MapMarkerProps {
  score: number;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ score }) => {
  // Determine color based on score
  let color = '#FF5252'; // Red for low scores
  if (score >= 70) color = '#FFC107'; // Yellow for medium scores
  if (score >= 90) color = '#4CAF50'; // Green for high scores

  return (
    <View style={[styles.markerContainer, { backgroundColor: color }]}>
      <Text style={styles.scoreText}>{score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
