import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const DeliveryTracker = ({ status }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="Driver Location"
        />
      </MapView>
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Delivery Status</Text>
        <Text style={[styles.status, styles[status]]}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: 200,
    marginBottom: 20,
  },
  statusContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  preparing: {
    backgroundColor: '#FFEB3B',
    color: '#000',
  },
  enroute: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  delivered: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
});

export default DeliveryTracker;
