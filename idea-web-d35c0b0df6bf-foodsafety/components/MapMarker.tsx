import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapMarkerProps {
  grade: string;
  onPress: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ grade, onPress }) => {
  // Determine color based on safety grade
  const getColor = () => {
    switch (grade) {
      case 'A':
        return '#4CAF50'; // Green
      case 'B':
        return '#FFC107'; // Yellow
      case 'C':
        return '#FF9800'; // Orange
      case 'F':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray for unknown
    }
  };

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.markerPin, { backgroundColor: getColor() }]}>
        <Text style={styles.markerText}>{grade}</Text>
      </View>
      <View style={[styles.markerTip, { borderTopColor: getColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: '#4CAF50',
    marginTop: -1,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MapMarker;
