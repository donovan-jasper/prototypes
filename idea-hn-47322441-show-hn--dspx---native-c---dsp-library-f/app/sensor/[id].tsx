import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '@/store';
import { getSensorById } from '@/lib/storage/sensors';
import { getSensorReadings } from '@/lib/storage/database';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnalyticsReport from '@/components/AnalyticsReport';

const screenWidth = Dimensions.get('window').width;

const SensorDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [sensor, setSensor] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { subscriptionStatus } = useStore();

  useEffect(() => {
    const loadSensorData = async () => {
      try {
        setLoading(true);
        const sensorData = await getSensorById(id as string);
        if (!sensorData) {
          setError('Sensor not found');
          return;
        }

        setSensor(sensorData);
        await loadReadings(sensorData.id, timeRange);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sensor data');
      } finally {
        setLoading(false);
      }
    };

    loadSensorData();
  }, [id]);

  const loadReadings = async (sensorId: string, range: '1h' | '6h' | '24h' | '7d' | '30d') => {
    try {
      const now = Date.now();
      let startTime = now;

      switch (range) {
        case '1h':
          startTime = now - 3600000;
          break;
        case '6h':
          startTime = now - 21600000;
          break;
        case '24h':
          startTime = now - 86400000;
          break;
        case '7d':
          startTime = now - 604800000;
          break;
        case '30d':
          startTime = now - 2592000000;
          break;
      }

      const readingsData = await getSensorReadings(sensorId, 1000, startTime, now);
      setReadings(readingsData);
    } catch (err) {
      console.error('Error loading readings:', err);
      setError('Failed to load sensor readings');
    }
  };

  const handleTimeRangeChange = (range: '1h' | '6h' | '24h' | '7d' | '30d') => {
    setTimeRange(range);
    if (sensor) {
      loadReadings(sensor.id, range);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!sensor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Sensor not found</Text>
      </View>
    );
  }

  const renderChart = () => {
    if (readings.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={styles.noDataText}>No data available for the selected time range</Text>
        </View>
      );
    }

    // Prepare data for chart
    const labels = readings.map((_, index) => index % 5 === 0 ? new Date(readings[index].timestamp).toLocaleTimeString() : '');
    const data = readings.map(reading => reading.value);

    return (
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ['Sensor Value']
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#007AFF'
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    );
  };

  const renderStats = () => {
    if (readings.length === 0) return null;

    const values = readings.map(r => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{min.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{max.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>{avg.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (showAnalytics) {
    return (
      <View style={styles.container}>
        <View style={styles.analyticsHeader}>
          <TouchableOpacity onPress={() => setShowAnalytics(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.analyticsTitle}>Analytics Report</Text>
        </View>
        <AnalyticsReport sensorId={sensor.id} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sensorName}>{sensor.name}</Text>
        <Text style={styles.sensorType}>{sensor.type}</Text>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: sensor.isConnected ? '#34C759' : '#FF3B30' }
          ]} />
          <Text style={styles.connectionText}>
            {sensor.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.currentValueContainer}>
        <Text style={styles.currentValueLabel}>Current Value</Text>
        <Text style={styles.currentValue}>
          {readings.length > 0 ? readings[readings.length - 1].value.toFixed(2) : '--'}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {renderStats()}

      <View style={styles.timeRangeContainer}>
        <Text style={styles.timeRangeLabel}>Time Range</Text>
        <View style={styles.timeRangeButtons}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '1h' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('1h')}
          >
            <Text style={styles.timeRangeButtonText}>1h</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '6h' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('6h')}
          >
            <Text style={styles.timeRangeButtonText}>6h</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '24h' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('24h')}
          >
            <Text style={styles.timeRangeButtonText}>24h</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '7d' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('7d')}
          >
            <Text style={styles.timeRangeButtonText}>7d</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '30d' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('30d')}
          >
            <Text style={styles.timeRangeButtonText}>30d</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={() => setShowAnalytics(true)}
        disabled={subscriptionStatus !== 'premium'}
      >
        <Ionicons name="analytics-outline" size={20} color="#007AFF" />
        <Text style={styles.analyticsButtonText}>View Analytics Report</Text>
        {subscriptionStatus !== 'premium' && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sensorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sensorType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#666',
  },
  currentValueContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentValueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeRangeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTimeRange: {
    backgroundColor: '#007AFF',
  },
  timeRangeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
  },
  analyticsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  premiumBadge: {
    backgroundColor: '#FF9500',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SensorDetailScreen;
