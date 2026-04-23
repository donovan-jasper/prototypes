import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { useStore } from '../../store/useStore';
import { getTotalPoints } from '../../lib/database';

const StatsScreen = () => {
  const { userStats, resetStreakIfNeeded } = useStore();
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await resetStreakIfNeeded();
        const points = await getTotalPoints();
        setTotalPoints(points);
      } catch (error) {
        console.error('Failed to fetch stats data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Stats</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Sessions</Text>
          <Text style={styles.statValue}>{userStats.totalSessions}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Focus Time</Text>
          <Text style={styles.statValue}>
            {Math.floor(userStats.totalFocusTime / 60)} hours
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Points</Text>
          <Text style={styles.statValue}>{totalPoints}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Longest Streak</Text>
          <Text style={styles.statValue}>{userStats.longestStreak} days</Text>
        </View>
      </View>

      <StreakCalendar currentStreak={userStats.currentStreak} />

      {/* Additional stats components would go here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StatsScreen;
