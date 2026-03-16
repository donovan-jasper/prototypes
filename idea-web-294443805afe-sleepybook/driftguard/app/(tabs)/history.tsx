import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getSleepHistory } from '@/lib/storage/database';
import PatternChart from '@/components/PatternChart';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getSleepHistory(7);
      setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sleep History</Text>
      <PatternChart data={history} />
      <View style={styles.stats}>
        <Text style={styles.statText}>Total Sleep Time: {calculateTotalSleepTime(history)} hours</Text>
        <Text style={styles.statText}>Average Episode: {calculateAverageDuration(history)} minutes</Text>
      </View>
    </ScrollView>
  );
};

const calculateTotalSleepTime = (history) => {
  const totalMinutes = history.reduce((sum, session) => sum + session.duration, 0);
  return (totalMinutes / 60).toFixed(1);
};

const calculateAverageDuration = (history) => {
  if (history.length === 0) return 0;
  const totalMinutes = history.reduce((sum, session) => sum + session.duration, 0);
  return Math.round(totalMinutes / history.length);
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
  stats: {
    marginTop: 20,
  },
  statText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default HistoryScreen;
