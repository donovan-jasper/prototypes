import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LearningPathCardProps {
  title: string;
  progress: number;
  onPress: () => void;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, progress, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    lineHeight: 20,
    fontSize: 12,
    color: '#333',
  },
});

export default LearningPathCard;
