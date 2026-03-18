import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Directory } from '@/lib/database';

interface DirectoryCardProps {
  directory: Directory;
  onPress: () => void;
}

export default function DirectoryCard({ directory, onPress }: DirectoryCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getCostColor = (cost: string) => {
    return cost.toLowerCase() === 'free' ? '#4CAF50' : '#FF9800';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {directory.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {directory.category}
          </Text>
        </View>
        <View style={styles.drBadge}>
          <Text style={styles.drScore}>{directory.drScore}</Text>
          <Text style={styles.drLabel}>DR</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {directory.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.tag}>
          <Text style={[styles.tagText, { color: getDifficultyColor(directory.submissionDifficulty) }]}>
            {directory.submissionDifficulty}
          </Text>
        </View>
        <View style={styles.tag}>
          <Text style={[styles.tagText, { color: getCostColor(directory.cost) }]}>
            {directory.cost}
          </Text>
        </View>
        <Text style={styles.approvalTime}>{directory.avgApprovalTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#666',
  },
  drBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  drScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvalTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
});
