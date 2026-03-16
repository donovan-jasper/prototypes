import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PerformanceChart from '../../components/PerformanceChart';
import StreakCounter from '../../components/StreakCounter';
import { getRecentScores } from '../../lib/database';

const DashboardScreen = () => {
  const [scores, setScores] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const recentScores = await getRecentScores('tap-timing', 30);
      setScores(recentScores);
      // Calculate streak from scores
      setStreak(5); // Mock streak
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StreakCounter streak={streak} />
      <Text style={styles.title}>Performance Trends</Text>
      <PerformanceChart data={scores} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default DashboardScreen;
