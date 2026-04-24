import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LearningPathCardProps {
  title: string;
  progress: number;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, progress }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.progress}>{progress}% Complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 14,
    color: '#666',
  },
});

export default LearningPathCard;
