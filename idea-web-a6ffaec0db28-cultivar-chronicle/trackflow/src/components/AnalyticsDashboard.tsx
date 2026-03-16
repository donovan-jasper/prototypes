import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Entry } from '../types';
import { getStreakCount } from '../services/database';

interface AnalyticsDashboardProps {
  categoryId: number;
  entries: Entry[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ categoryId, entries }) => {
  const [streak, setStreak] = React.useState(0);

  React.useEffect(() => {
    const fetchStreak = async () => {
      const streakCount = await getStreakCount(categoryId);
      setStreak(streakCount);
    };
    fetchStreak();
  }, [categoryId, entries]);

  return (
    <View style={styles.container}>
      <View style={styles.streakCard}>
        <Text style={styles.streakLabel}>Current Streak</Text>
        <Text style={styles.streakCount}>{streak} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  streakCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AnalyticsDashboard;
