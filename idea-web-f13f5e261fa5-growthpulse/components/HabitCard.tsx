import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HabitCardProps {
  name: string;
  streak: number;
  progress: number;
  onPress: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ name, streak, progress, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.habitName}>{name}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={16} color="#FF5722" />
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.statValue}>{Math.round(progress)}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 3,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 3,
  },
});

export default HabitCard;
