import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakDataForCalendar, getGraceDaysUsedThisWeek } from '../../lib/affirmations';
import { useStore } from '../../store/useStore';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);
  const [graceDaysUsed, setGraceDaysUsed] = useState(0);
  const { streakCount } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStreakDataForCalendar();
      setStreakData(data);

      const today = new Date();
      const used = await getGraceDaysUsedThisWeek(today);
      setGraceDaysUsed(used);
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Streak</Text>
        <Text style={styles.streakCount}>{streakCount} days</Text>
      </View>

      <StreakCalendar streakData={streakData} />

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{streakCount} days</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Grace Days Used</Text>
          <Text style={styles.statValue}>{graceDaysUsed}/2</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What are Grace Days?</Text>
        <Text style={styles.infoText}>
          Grace days allow you to skip a day without breaking your streak. You can use up to 2 grace days per week.
          This helps maintain your momentum when life gets busy.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakCount: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default StreakScreen;
