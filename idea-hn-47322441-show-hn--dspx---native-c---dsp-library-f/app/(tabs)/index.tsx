import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SensorCard } from '@/components/SensorCard';
import { getSensors } from '@/lib/storage/sensors';
import { registerBackgroundTask, startBackgroundMonitoring } from '@/lib/sensors/background';
import { setupNotifications } from '@/lib/alerts/notifications';

export default function DashboardScreen() {
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Setup notifications
        await setupNotifications();

        // Register background task
        await registerBackgroundTask();

        // Start background monitoring
        await startBackgroundMonitoring();

        // Load sensors
        const loadedSensors = await getSensors();
        setSensors(loadedSensors);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      // Stop background monitoring when screen is no longer focused
      // This would be better handled with a focus listener
    };
  }, []);

  const handleSensorPress = (sensorId) => {
    navigation.navigate('sensor', { id: sensorId });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading sensors...</Text>
      </View>
    );
  }

  if (sensors.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No sensors connected</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('sensors')}
        >
          <Text style={styles.addButtonText}>Add Sensor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sensors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SensorCard
            sensor={item}
            onPress={() => handleSensorPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
