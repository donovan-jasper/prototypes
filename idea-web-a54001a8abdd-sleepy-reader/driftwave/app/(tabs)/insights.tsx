import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SleepChart from '../../components/SleepChart';
import { useSleepStore } from '../../store/useSleepStore';

export default function InsightsScreen() {
  const { sleepHistory, calculateSleepScore } = useSleepStore();
  const [sleepScore, setSleepScore] = useState(0);
  const [averageDuration, setAverageDuration] = useState(0);

  useEffect(() => {
    if (sleepHistory.length > 0) {
      const score = calculateSleepScore();
      setSleepScore(score);

      const totalDuration = sleepHistory.reduce((sum, session) => sum + session.duration, 0);
      const avgDuration = totalDuration / sleepHistory.length;
      setAverageDuration(avgDuration);
    }
  }, [sleepHistory]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your sleep performance</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Sleep Score</Text>
        <Text style={styles.scoreValue}>{sleepScore}</Text>
        <Text style={styles.scoreDescription}>
          {sleepScore >= 80 ? 'Excellent' : sleepScore >= 60 ? 'Good' : 'Needs Improvement'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sleepHistory.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor(averageDuration / 60)}h {averageDuration % 60}m</Text>
          <Text style={styles.statLabel}>Average Duration</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sleep History</Text>
        <SleepChart data={sleepHistory} />
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Personalized Tips</Text>
        <Text style={styles.tipItem}>• Try the "Whispering Forest" story for better sleep quality</Text>
        <Text style={styles.tipItem}>• Consider using the Ocean Waves soundscape for faster sleep onset</Text>
        <Text style={styles.tipItem}>• Aim for consistent bedtime to improve sleep regularity</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 8,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipItem: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
});
