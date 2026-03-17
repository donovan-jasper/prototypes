import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Issue } from '../types';

interface IssueCardProps {
  issue: Issue;
  onClaim: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClaim }) => {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return '#4CAF50'; // Green
    if (difficulty <= 4) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.repoName}>{issue.repository.name}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(issue.difficulty) }]}>
          <Text style={styles.difficultyText}>
            {issue.difficulty <= 2 ? 'Easy' : issue.difficulty <= 4 ? 'Medium' : 'Hard'}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{issue.title}</Text>

      <View style={styles.labelsContainer}>
        {issue.labels.map((label, index) => (
          <View key={index} style={styles.label}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.claimButton}
        onPress={onClaim}
      >
        <Text style={styles.claimButtonText}>Claim Issue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  label: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 12,
    color: '#424242',
  },
  claimButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default IssueCard;
