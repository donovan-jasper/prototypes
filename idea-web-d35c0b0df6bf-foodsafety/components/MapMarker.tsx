import React from 'react';
import { View, StyleSheet } from 'react-native';
import SafetyBadge from './SafetyBadge';

interface MapMarkerProps {
  grade: string;
  onPress: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ grade, onPress }) => {
  return (
    <View style={styles.markerContainer}>
      <SafetyBadge grade={grade} size={32} />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapMarker;
