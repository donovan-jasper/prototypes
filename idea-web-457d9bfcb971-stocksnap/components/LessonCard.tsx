import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lesson } from '../types/lesson';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  onPress: () => void;
}

export default function LessonCard({ lesson, isCompleted, onPress }: LessonCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={lesson.isPremium && !isCompleted}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.isPremium && !isCompleted && (
          <View style={styles.lockContainer}>
            <Text style={styles.lockText}>Premium</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {lesson.description}
      </Text>

      <View style={styles.progressContainer}>
        {isCompleted ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${lesson.progress || 0}%` }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  lockContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lockText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  completedContainer: {
    backgroundColor: '#4CAF50',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});
