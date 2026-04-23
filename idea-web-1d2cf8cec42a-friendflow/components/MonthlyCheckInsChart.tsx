import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useContactStore } from '../store/contactStore';
import { getMonthlyCheckIns } from '../lib/analytics';
import InsightChart from './InsightChart';
import { format } from 'date-fns';
import { useTheme } from 'react-native-paper';

const MonthlyCheckInsChart = () => {
  const { interactions, loading, error } = useContactStore();
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [{ data: [] }] });
  const [isProcessing, setIsProcessing] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (loading || error) {
      setIsProcessing(false);
      return;
    }

    if (interactions.length === 0) {
      setIsProcessing(false);
      return;
    }

    try {
      setIsProcessing(true);
      const currentDate = new Date();
      const monthlyCheckIns = getMonthlyCheckIns(interactions, currentDate);

      const labels = Object.keys(monthlyCheckIns)
        .sort()
        .map(month => {
          const [year, monthNum] = month.split('-');
          return format(new Date(Number(year), Number(monthNum) - 1), 'MMM yy');
        });

      const data = Object.values(monthlyCheckIns);

      setChartData({
        labels,
        datasets: [{ data }],
      });
      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing chart data:', err);
      setIsProcessing(false);
    }
  }, [interactions, loading, error]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your check-in data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load check-in data</Text>
        <Text style={styles.errorDetail}>{error.message || 'Unknown error'}</Text>
      </View>
    );
  }

  if (interactions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No check-in data available</Text>
        <Text style={styles.emptyDetail}>Start logging interactions to see your progress</Text>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Processing your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InsightChart
        data={chartData}
        title="Monthly Check-ins"
        yAxisSuffix=" interactions"
        chartConfig={{
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          color: (opacity = 1) => theme.colors.primary,
          labelColor: (opacity = 1) => theme.colors.text,
          style: {
            borderRadius: 16,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    minHeight: 300,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default MonthlyCheckInsChart;
