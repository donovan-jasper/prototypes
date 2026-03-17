import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import LessonCard from '../../components/LessonCard';
import { lessons } from '../../constants/lessons';
import { getLessonProgress, saveLessonProgress } from '../../lib/database';
import { useLessonsStore } from '../../store/useLessonsStore';

type LearnScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Learn'>;

export default function LearnScreen() {
  const navigation = useNavigation<LearnScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const { completedLessons, setCompletedLessons } = useLessonsStore();
  const [lastIncompleteLesson, setLastIncompleteLesson] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getLessonProgress();
        const completed = progress.filter(item => item.completed).map(item => item.lesson_id);
        setCompletedLessons(completed);

        // Find the first incomplete lesson
        const firstIncomplete = lessons.find(lesson => !completed.includes(lesson.id));
        setLastIncompleteLesson(firstIncomplete?.id || null);
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate('Lesson', { id: lessonId });
  };

  const handleContinueLearning = () => {
    if (lastIncompleteLesson) {
      navigation.navigate('Lesson', { id: lastIncompleteLesson });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lastIncompleteLesson && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueLearning}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>Learn Investing</Text>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonCard
            lesson={item}
            isCompleted={completedLessons.includes(item.id)}
            onPress={() => handleLessonPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
