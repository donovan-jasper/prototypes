import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const SpendingChart = ({ transactions }) => {
  // Group transactions by day and calculate total spending per day
  const spendingByDay = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const day = date.toISOString().split('T')[0];
    if (transaction.type === 'expense') {
      acc[day] = (acc[day] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  // Get the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Prepare data for the chart
  const data = {
    labels: last7Days.map((day) => day.slice(5)),
    datasets: [
      {
        data: last7Days.map((day) => spendingByDay[day] || 0),
      },
    ],
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.title}>Spending (Last 7 Days)</Text>
      <BarChart
        data={data}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SpendingChart;
