import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-svg-charts';
import { Session } from '../types';

interface InsightsChartProps {
  sessions: Session[];
}

export const InsightsChart: React.FC<InsightsChartProps> = ({ sessions }) => {
  // Process sessions data for chart
  const data = sessions.map(session => ({
    value: (session.endTime - session.startTime) / 1000 / 60, // Convert to minutes
    label: new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Focus Time</Text>
      <View style={styles.chartContainer}>
        <BarChart
          style={styles.chart}
          data={data}
          svg={{ fill: '#007AFF' }}
          contentInset={{ top: 20, bottom: 20 }}
          spacing={0.2}
          gridMin={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartContainer: {
    height: 200,
  },
  chart: {
    flex: 1,
  },
});
