import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Drill } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';

interface DrillCardProps {
  drill: Drill;
  onPress: () => void;
  isPremium?: boolean;
}

const DrillCard: React.FC<DrillCardProps> = ({ drill, onPress, isPremium = false }) => {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.3) return '#4CAF50'; // Green for easy
    if (difficulty < 0.7) return '#FFC107'; // Yellow for medium
    return '#F44336'; // Red for hard
  };

  return (
    <TouchableOpacity
      style={[styles.card, !isPremium && styles.premiumCard]}
      onPress={onPress}
      disabled={!isPremium}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{drill.name}</Text>
        {!isPremium && (
          <Ionicons name="lock-closed" size={20} color="#666" style={styles.lockIcon} />
        )}
      </View>

      <Text style={styles.description}>{drill.description}</Text>

      <View style={styles.footer}>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>Difficulty:</Text>
          <View style={styles.difficultyBar}>
            <View
              style={[
                styles.difficultyFill,
                { width: `${Math.round(drill.difficulty * 100)}%`, backgroundColor: getDifficultyColor(drill.difficulty) }
              ]}
            />
          </View>
          <Text style={styles.difficultyValue}>{Math.round(drill.difficulty * 100)}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Best: {drill.bestScore.toFixed(0)}</Text>
          <Text style={styles.statText}>Type: {drill.type}</Text>
        </View>
      </View>

      {drill.difficultyChange !== undefined && (
        <View style={[
          styles.difficultyChangeIndicator,
          drill.difficultyChange > 0 ? styles.increase : styles.decrease
        ]}>
          <Ionicons
            name={drill.difficultyChange > 0 ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={drill.difficultyChange > 0 ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.difficultyChangeText}>
            {Math.abs(drill.difficultyChange)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lockIcon: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  difficultyLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  difficultyBar: {
    height: 8,
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  difficultyFill: {
    height: '100%',
    borderRadius: 4,
  },
  difficultyValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 30,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  difficultyChangeIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  increase: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  decrease: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  difficultyChangeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default DrillCard;
