import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { Drill } from '../lib/types';

interface DrillCardProps {
  drill: Drill;
}

export default function DrillCard({ drill }: DrillCardProps) {
  const { startDrill } = useStore();

  const handlePress = () => {
    startDrill(drill.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.title}>{drill.name}</Text>
        <Text style={styles.description}>{drill.description}</Text>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>Difficulty:</Text>
          <Text style={styles.difficultyValue}>{drill.difficulty}</Text>
        </View>
        <Text style={styles.bestScore}>Best Score: {drill.bestScore || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  difficultyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  bestScore: {
    fontSize: 14,
    color: '#666',
  },
});
