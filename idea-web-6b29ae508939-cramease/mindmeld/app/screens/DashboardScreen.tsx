import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const DashboardScreen: React.FC = () => {
  const [streak, setStreak] = useState(0);
  const [masteryPercentage, setMasteryPercentage] = useState(0);
  const [heatmapData, setHeatmapData] = useState<number[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setStreak(7);
    setMasteryPercentage(85);
    setHeatmapData([1, 3, 2, 5, 4, 6, 3, 2, 4, 5, 7, 6, 5, 4, 3, 2, 1, 0, 2, 3, 4]);
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    strokeWidth: 2,
  };

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: heatmapData,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mastery Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Streak</Text>
        <Text style={styles.streakValue}>{streak} days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mastery Percentage</Text>
        <Text style={styles.masteryValue}>{masteryPercentage}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Review Activity</Text>
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'center',
  },
  masteryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardScreen;
