import * as Location from 'expo-location';

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Location permissions not granted');
  }
};

export const setupGeofence = async (memory: any) => {
  const location = await Location.getCurrentPositionAsync({});
  const region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    radius: 100, // 100 meters
  };

  Location.startGeofencingAsync('memorymate', [region], (event) => {
    if (event.region.latitude === region.latitude && event.region.longitude === region.longitude) {
      // Trigger memory
      console.log('Geofence triggered:', memory);
    }
  });
};
