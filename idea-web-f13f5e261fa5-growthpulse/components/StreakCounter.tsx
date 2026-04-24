import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StreakCounterProps {
  habitName: string;
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ habitName, streak }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Current Streak</Text>
        <Text style={styles.habitName}>{habitName}</Text>
        <Text style={styles.streakCount}>{streak} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
});

export default StreakCounter;
