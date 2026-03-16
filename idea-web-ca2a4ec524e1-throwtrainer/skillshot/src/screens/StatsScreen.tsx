import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatsCard from '../components/StatsCard';
import { getStats } from '../services/database';

const StatsScreen = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      <StatsCard label="Best Streak" value={stats.bestStreak} />
      <StatsCard label="Highest Accuracy" value={`${stats.highestAccuracy}%`} />
      <StatsCard label="Total Shots" value={stats.totalShots} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default StatsScreen;
