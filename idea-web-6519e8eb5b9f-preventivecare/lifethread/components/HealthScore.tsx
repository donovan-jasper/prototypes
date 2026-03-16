import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const HealthScore = ({ score }) => {
  const data = {
    labels: ['Health Score'],
    data: [score / 100],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(103, 58, 183, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <View style={styles.container}>
      <ProgressChart
        data={data}
        width={150}
        height={150}
        strokeWidth={16}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={true}
      />
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>Health Score</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
});

export default HealthScore;
