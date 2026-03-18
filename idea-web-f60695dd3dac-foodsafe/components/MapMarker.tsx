import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapMarkerProps {
  score: number;
  color: string;
}

export default function MapMarker({ score, color }: MapMarkerProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Text style={styles.score}>{score}</Text>
      </View>
      <View style={[styles.triangle, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
