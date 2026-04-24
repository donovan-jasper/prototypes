import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

interface HabitCardProps {
  title: string;
  streak: number;
  progress: number;
}

const HabitCard: React.FC<HabitCardProps> = ({ title, streak, progress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.streak}>{streak} day streak</Text>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  streak: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
});

export default HabitCard;
