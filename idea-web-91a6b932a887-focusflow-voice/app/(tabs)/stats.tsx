import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../store/useStore';
import { getStreak, getTotalPoints } from '../../lib/database';
import { format } from 'date-fns';

const StatsScreen = () => {
  const { userStats } = useStore();
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const currentStreak = await getStreak();
      const points = await getTotalPoints();
      setStreak(currentStreak);
      setTotalPoints(points);
    };

    loadStats();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Stats</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{streak} days</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Longest Streak</Text>
          <Text style={styles.statValue}>{userStats.longestStreak} days</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Points</Text>
          <Text style={styles.statValue}>{totalPoints}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Focus Time</Text>
          <Text style={styles.statValue}>{userStats.totalFocusTime} minutes</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Streak Calendar</Text>
        <View style={styles.calendar}>
          {/* Simplified calendar - in a real app, you'd render actual days */}
          {[...Array(30)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.calendarDay,
                i < streak && styles.completedDay,
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.exportButton}>
        <Text style={styles.exportButtonText}>Export Data (Premium)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    margin: '0.5%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  completedDay: {
    backgroundColor: '#4CAF50',
  },
  exportButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default StatsScreen;
