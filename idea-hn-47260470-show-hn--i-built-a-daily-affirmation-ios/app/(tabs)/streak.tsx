import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData } from '../../lib/database';
import { useStore } from '../../store/useStore';

const StreakScreen = () => {
  const [streakData, setStreakData] = useState([]);
  const streakCount = useStore((state) => state.streakCount);

  useEffect(() => {
    const fetchStreakData = async () => {
      const data = await getStreakData();
      setStreakData(data);
    };

    fetchStreakData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Streak</Text>
      <Text style={styles.streakCount}>Current Streak: {streakCount} days</Text>
      <StreakCalendar streakData={streakData} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  streakCount: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
});

export default StreakScreen;
