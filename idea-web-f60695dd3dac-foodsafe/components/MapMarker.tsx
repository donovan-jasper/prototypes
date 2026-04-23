import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Restaurant } from '@/types';

interface MapMarkerProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ restaurant, onPress }) => {
  // Determine marker color based on safety score
  const getMarkerColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <Marker
      coordinate={{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerPin, { backgroundColor: getMarkerColor(restaurant.safetyScore) }]} />
        <View style={styles.markerPinBorder} />
        <View style={styles.markerLabel}>
          <Text style={styles.markerText} numberOfLines={1}>
            {restaurant.name}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPinBorder: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  markerLabel: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
});

export default MapMarker;
