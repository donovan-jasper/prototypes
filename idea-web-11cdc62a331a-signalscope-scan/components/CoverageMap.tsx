import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { getHealthColor } from '@/utils/signalCalculator';

export default function CoverageMap() {
  const { readings, isLoading, error } = useLocationHistory(50);

  const region = useMemo(() => {
    if (readings.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = readings.map(r => r.latitude);
    const longitudes = readings.map(r => r.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [readings]);

  const getHealthScore = (signalStrength: number): number => {
    return Math.round(signalStrength * 10);
  };

  const getPinColor = (signalStrength: number): string => {
    const score = getHealthScore(signalStrength);
    return getHealthColor(score);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading coverage map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (readings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No coverage data yet</Text>
        <Text style={styles.emptySubtext}>
          Signal readings will appear here as you use the app
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {readings.map((reading) => (
          <Marker
            key={reading.id}
            coordinate={{
              latitude: reading.latitude,
              longitude: reading.longitude,
            }}
            pinColor={getPinColor(reading.signal_strength)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  Signal: {getHealthScore(reading.signal_strength)}/100
                </Text>
                <Text style={styles.calloutText}>
                  Network: {reading.network_type}
                </Text>
                {reading.carrier && (
                  <Text style={styles.calloutText}>
                    Carrier: {reading.carrier}
                  </Text>
                )}
                {reading.download_speed && (
                  <Text style={styles.calloutText}>
                    Download: {reading.download_speed.toFixed(1)} Mbps
                  </Text>
                )}
                {reading.upload_speed && (
                  <Text style={styles.calloutText}>
                    Upload: {reading.upload_speed.toFixed(1)} Mbps
                  </Text>
                )}
                {reading.latency && (
                  <Text style={styles.calloutText}>
                    Latency: {reading.latency}ms
                  </Text>
                )}
                <Text style={styles.calloutTime}>
                  {new Date(reading.timestamp).toLocaleString()}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Good (70-100)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Fair (40-69)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Poor (0-39)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  callout: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});
