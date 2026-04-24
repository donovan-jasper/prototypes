import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  habitName: string;
  streak: number;
  onPress: () => void;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ habitName, streak, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="flame-outline" size={24} color="#FF5722" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Current Streak</Text>
        <Text style={styles.habitName}>{habitName}</Text>
      </View>
      <View style={styles.streakContainer}>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>days</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#666',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  streakContainer: {
    alignItems: 'flex-end',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default StreakCounter;
