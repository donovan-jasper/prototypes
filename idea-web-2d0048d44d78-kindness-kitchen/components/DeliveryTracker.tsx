import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const DeliveryTracker = ({ gift }) => {
  const [status, setStatus] = useState('preparing');
  const [driverLocation, setDriverLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  useEffect(() => {
    // Simulate delivery progress
    const statuses = ['preparing', 'en route', 'delivered'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statuses.length - 1) {
        currentIndex++;
        setStatus(statuses[currentIndex]);

        // Simulate driver moving
        if (statuses[currentIndex] === 'en route') {
          setDriverLocation(prev => ({
            latitude: prev.latitude + 0.001,
            longitude: prev.longitude + 0.001,
          }));
        }
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (step) => {
    if (status === 'delivered' && step === 'delivered') return '#4CAF50';
    if (status === 'en route' && step === 'en route') return '#FF9800';
    if (status === 'preparing' && step === 'preparing') return '#FF6B6B';
    return '#ccc';
  };

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
        {status === 'en route' && (
          <Marker
            coordinate={driverLocation}
            title="Driver Location"
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/184/184539.png' }}
              style={styles.driverIcon}
            />
          </Marker>
        )}
      </MapView>

      <View style={styles.statusContainer}>
        <View style={styles.statusBar}>
          <View style={[styles.statusStep, { backgroundColor: getStatusColor('preparing') }]} />
          <View style={[styles.statusStep, { backgroundColor: getStatusColor('en route') }]} />
          <View style={[styles.statusStep, { backgroundColor: getStatusColor('delivered') }]} />
        </View>

        <View style={styles.statusLabels}>
          <Text style={styles.statusLabel}>Preparing</Text>
          <Text style={styles.statusLabel}>En Route</Text>
          <Text style={styles.statusLabel}>Delivered</Text>
        </View>

        <Text style={styles.currentStatus}>
          {status === 'preparing' && 'Your order is being prepared'}
          {status === 'en route' && 'Your driver is on the way'}
          {status === 'delivered' && 'Your gift has been delivered!'}
        </Text>

        {status === 'delivered' && (
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  driverIcon: {
    width: 40,
    height: 40,
  },
  statusContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusStep: {
    width: '30%',
    height: 5,
    borderRadius: 5,
  },
  statusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: '30%',
  },
  currentStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DeliveryTracker;
