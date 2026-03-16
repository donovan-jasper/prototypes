import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ProgressChart from '../../components/ProgressChart';
import { getUserStats } from '../../lib/database';
import { UserStats } from '../../lib/types';

export default function Analytics() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const userStats = await getUserStats();
      setStats(userStats);
    };
    loadStats();
  }, []);

  if (!stats) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container}>
      <ProgressChart
        title="Accuracy"
        data={stats.accuracyHistory}
        color="#4caf50"
      />
      <ProgressChart
        title="Reaction Time"
        data={stats.reactionTimeHistory}
        color="#f44336"
      />
      <ProgressChart
        title="Consistency"
        data={stats.consistencyHistory}
        color="#2196f3"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
