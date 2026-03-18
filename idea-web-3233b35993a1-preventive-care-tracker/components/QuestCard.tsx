import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
}

export default function QuestCard({ quest }: QuestCardProps) {
  const progress = Math.min(quest.progress, quest.target);
  const progressPercentage = (progress / quest.target) * 100;

  return (
    <View style={[styles.card, quest.completed && styles.completedCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{quest.title}</Text>
          {quest.completed && (
            <Text style={styles.badge}>✓</Text>
          )}
        </View>
        <Text style={styles.points}>+{quest.points} pts</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` },
              quest.completed && styles.completedProgressFill
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress}/{quest.target} {quest.type === 'checkups' ? 'checkups' : 'days'}
        </Text>
      </View>

      <Text style={styles.description}>{quest.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    fontSize: 20,
    color: '#4CAF50',
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  completedProgressFill: {
    backgroundColor: '#2E7D32',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});
