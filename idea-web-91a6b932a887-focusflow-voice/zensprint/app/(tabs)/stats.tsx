import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import StreakCalendar from '../../components/StreakCalendar';
import StatsChart from '../../components/StatsChart';

export default function StatsScreen() {
  const { userStats } = useStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streak Calendar</Text>
        <StreakCalendar />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Time</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.todayFocusTime} min</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.weeklyFocusTime} min</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.monthlyFocusTime} min</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <StatsChart data={userStats.completionRate} type="completion" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Productive Hours</Text>
        <StatsChart data={userStats.productiveHours} type="hours" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d3436',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f5f6fa',
    padding: 10,
    borderRadius: 5,
    width: '30%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c5ce7',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
  },
});
