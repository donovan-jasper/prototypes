import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Learn: undefined;
  Lesson: { id: string };
  Stock: { symbol: string };
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Learn: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
};


+++++ app/lesson/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { lessons } from '../../constants/lessons';
import { saveLessonProgress } from '../../lib/database';
import { useLessonsStore } from '../../store/useLessonsStore';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { addCompletedLesson } = useLessonsStore();

  useEffect(() => {
    const foundLesson = lessons.find(l => l.id === id);
    if (foundLesson) {
      setLesson(foundLesson);
    } else {
      navigation.goBack();
    }
  }, [id]);

  const handleAnswer = (selectedAnswer: number) => {
    if (lesson && lesson.quiz[currentQuestion].correctAnswer === selectedAnswer) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < (lesson?.quiz.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      saveProgress();
    }
  };

  const saveProgress = async () => {
    if (lesson) {
      try {
        await saveLessonProgress(lesson.id, true, score);
        addCompletedLesson(lesson.id);
      } catch (error) {
        console.error('Failed to save lesson progress:', error);
      }
    }
  };

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>

      {!showQuiz ? (
        <>
          <Text style={styles.content}>{lesson.content}</Text>

          <TouchableOpacity
            style={styles.startQuizButton}
            onPress={() => setShowQuiz(true)}
          >
            <Text style={styles.startQuizButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.quizContainer}>
          {quizCompleted ? (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Quiz Completed!</Text>
              <Text style={styles.resultsText}>
                You scored {score} out of {lesson.quiz.length}
              </Text>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneButtonText}>Back to Lessons</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.questionText}>
                Question {currentQuestion + 1} of {lesson.quiz.length}
              </Text>

              <Text style={styles.question}>{lesson.quiz[currentQuestion].question}</Text>

              {lesson.quiz[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(index)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
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
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  startQuizButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startQuizButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quizContainer: {
    marginTop: 24,
  },
  questionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
