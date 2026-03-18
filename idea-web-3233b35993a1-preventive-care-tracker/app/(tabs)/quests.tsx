import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import QuestCard from '../../components/QuestCard';

export default function QuestsScreen() {
  const { quests, totalPoints } = useStore((state) => ({
    quests: state.quests,
    totalPoints: state.totalPoints,
  }));

  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quests</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{totalPoints}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Quests</Text>
        {activeQuests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active quests</Text>
          </View>
        ) : (
          activeQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))
        )}
      </View>

      {completedQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Quests</Text>
          {completedQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  pointsContainer: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
