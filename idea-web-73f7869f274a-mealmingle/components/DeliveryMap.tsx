import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Text } from 'react-native-paper';

export default function DeliveryMap({ driverLocation }) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [driverPosition, setDriverPosition] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  useEffect(() => {
    // Simulate driver movement
    const interval = setInterval(() => {
      setDriverPosition(prev => ({
        latitude: prev.latitude + 0.0001,
        longitude: prev.longitude + 0.0001,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker
          coordinate={driverPosition}
          title="Driver"
          description="Your food is on the way!"
        />
      </MapView>
      <View style={styles.etaContainer}>
        <Text variant="titleMedium">Estimated Time of Arrival</Text>
        <Text variant="headlineSmall">5-10 minutes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginVertical: 16,
  },
  map: {
    flex: 1,
  },
  etaContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
});
