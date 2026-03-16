import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function InsightsScreen() {
  const { summary, friendsNeedingAttention, longestStreaks } = useAnalytics();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.totalFriends}</Text>
          <Text style={styles.summaryLabel}>Friends</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.averageStreak}</Text>
          <Text style={styles.summaryLabel}>Avg Streak</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.interactionsThisMonth}</Text>
          <Text style={styles.summaryLabel}>Interactions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends Needing Attention</Text>
        {friendsNeedingAttention.map(friend => (
          <View key={friend.id} style={styles.friendItem}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendScore}>{friend.score}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Longest Streaks</Text>
        {longestStreaks.map(friend => (
          <View key={friend.id} style={styles.friendItem}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendScore}>{friend.streak} days</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  friendName: {
    fontSize: 16,
  },
  friendScore: {
    fontSize: 16,
    color: '#FF6B6B',
  },
});
