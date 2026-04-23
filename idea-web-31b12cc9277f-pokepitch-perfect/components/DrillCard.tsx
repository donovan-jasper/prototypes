import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Drill } from '../lib/types';

interface DrillCardProps {
  drill: Drill;
  onPress: () => void;
}

const DrillCard: React.FC<DrillCardProps> = ({ drill, onPress }) => {
  const getDifficultyColor = () => {
    if (drill.difficulty < 0.33) return '#4CAF50'; // Green for easy
    if (drill.difficulty < 0.66) return '#FFC107'; // Yellow for medium
    return '#F44336'; // Red for hard
  };

  const getDifficultyText = () => {
    if (drill.difficulty < 0.33) return 'Easy';
    if (drill.difficulty < 0.66) return 'Medium';
    return 'Hard';
  };

  const getIconName = () => {
    switch (drill.type) {
      case 'aim':
        return 'locate';
      case 'timing':
        return 'timer';
      case 'swipe':
        return 'swipe';
      case 'pattern':
        return 'grid';
      case 'reflex':
        return 'flash';
      default:
        return 'game-controller';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIconName()} size={30} color="#6200EE" />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{drill.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {drill.description}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{drill.duration}s</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="bar-chart-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Best: {drill.bestScore || 0}</Text>
          </View>

          <View style={[styles.detailItem, styles.difficultyItem]}>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor() }]} />
            <Text style={[styles.detailText, { color: getDifficultyColor() }]}>
              {getDifficultyText()}
            </Text>
          </View>
        </View>

        {drill.difficultyChange !== undefined && drill.difficultyChange !== 0 && (
          <View style={[
            styles.difficultyChange,
            drill.difficultyChange > 0 ? styles.difficultyIncrease : styles.difficultyDecrease
          ]}>
            <Ionicons
              name={drill.difficultyChange > 0 ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={drill.difficultyChange > 0 ? '#4CAF50' : '#F44336'}
            />
            <Text style={[
              styles.difficultyChangeText,
              drill.difficultyChange > 0 ? styles.difficultyIncreaseText : styles.difficultyDecreaseText
            ]}>
              {Math.abs(drill.difficultyChange * 100)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  difficultyItem: {
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  difficultyChange: {
    position: 'absolute',
    top: -10,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyIncrease: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  difficultyDecrease: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  difficultyChangeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  difficultyIncreaseText: {
    color: '#4CAF50',
  },
  difficultyDecreaseText: {
    color: '#F44336',
  },
});

export default DrillCard;
