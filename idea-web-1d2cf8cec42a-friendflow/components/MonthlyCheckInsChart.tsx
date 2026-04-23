import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useContactStore } from '../store/contactStore';
import { getMonthlyCheckIns } from '../lib/analytics';
import InsightChart from './InsightChart';
import { format } from 'date-fns';

const MonthlyCheckInsChart = () => {
  const { interactions } = useContactStore();
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    if (interactions.length === 0) return;

    const currentDate = new Date();
    const monthlyCheckIns = getMonthlyCheckIns(interactions, currentDate);

    const labels = Object.keys(monthlyCheckIns).map(month => {
      const [year, monthNum] = month.split('-');
      return format(new Date(Number(year), Number(monthNum) - 1), 'MMM yy');
    });

    const data = Object.values(monthlyCheckIns);

    setChartData({
      labels,
      datasets: [{ data }],
    });
  }, [interactions]);

  return (
    <View style={styles.container}>
      <InsightChart
        data={chartData}
        title="Monthly Check-ins"
        yAxisSuffix=" interactions"
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
  },
});

export default MonthlyCheckInsChart;
