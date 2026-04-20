import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Sensor } from '@/types/sensors';

interface SensorCardProps {
  sensor: Sensor;
  onPress: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onPress }) => {
  // Mock data for the chart - in a real app, this would come from recent readings
  const chartData = {
    labels: ['', '', '', '', '', ''],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Value'],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: '#4CAF50',
    },
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{sensor.name}</Text>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: sensor.isActive ? '#4CAF50' : '#F44336' }
        ]} />
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={300}
          height={100}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.value}>Current: {sensor.lastValue || 'N/A'}</Text>
        {sensor.batteryLevel !== undefined && (
          <Text style={styles.battery}>Battery: {Math.round(sensor.batteryLevel * 100)}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartContainer: {
    marginVertical: 8,
  },
  chart: {
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  battery: {
    fontSize: 12,
    color: '#666',
  },
});
