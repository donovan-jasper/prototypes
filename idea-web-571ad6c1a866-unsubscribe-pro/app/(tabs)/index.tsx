import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HealthScore from '../../components/HealthScore';
import { useEmailStore } from '../../store/email-store';
import { useHealthScore } from '../../hooks/useHealthScore';
import { useRouter } from 'expo-router';

const DashboardScreen = () => {
  const { emails } = useEmailStore();
  const { calculateScore, getTimeSaved } = useHealthScore();
  const [score, setScore] = useState(100);
  const [timeSaved, setTimeSaved] = useState('0 hours');
  const router = useRouter();

  useEffect(() => {
    const currentScore = calculateScore();
    setScore(currentScore);
    setTimeSaved(getTimeSaved());
  }, [emails]);

  const navigateToScan = () => {
    router.push('/scan');
  };

  const navigateToInsights = () => {
    router.push('/insights');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox Health</Text>
        <Text style={styles.subtitle}>Your email wellness dashboard</Text>
      </View>

      <HealthScore score={score} />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="email" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{emails.length}</Text>
          <Text style={styles.statLabel}>Emails Processed</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="access-time" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{timeSaved}</Text>
          <Text style={styles.statLabel}>Time Saved</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Health Score</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToScan}>
          <MaterialIcons name="search" size={24} color="white" />
          <Text style={styles.actionText}>Scan Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={navigateToInsights}>
          <MaterialIcons name="insights" size={24} color="#2196F3" />
          <Text style={[styles.actionText, styles.secondaryText]}>View Insights</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>Pro Tip</Text>
        <Text style={styles.tipText}>
          Scan your inbox daily to maintain a clean inbox. The more you clean, the better your health score becomes!
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
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryText: {
    color: '#2196F3',
  },
  tipContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DashboardScreen;
