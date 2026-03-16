import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export default function AnalyticsChart({ sales }) {
  const data = {
    labels: ['TikTok', 'Instagram', 'Facebook'],
    datasets: [
      {
        data: [
          sales.filter((sale) => sale.platform === 'TikTok').reduce((sum, sale) => sum + sale.amount, 0),
          sales.filter((sale) => sale.platform === 'Instagram').reduce((sum, sale) => sum + sale.amount, 0),
          sales.filter((sale) => sale.platform === 'Facebook').reduce((sum, sale) => sum + sale.amount, 0),
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Earnings by Platform</Text>
      <BarChart
        data={data}
        width={300}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
