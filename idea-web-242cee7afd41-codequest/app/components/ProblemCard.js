import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export default function ProblemCard({ problem, onAnswer, problemNumber, totalProblems }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const handleOptionPress = (index) => {
    if (showFeedback) return;

    setSelectedOption(index);
    const correct = index === problem.correctAnswer;
    setIsCorrect(correct);

    // Show feedback with animation
    setShowFeedback(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Notify parent component after delay
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  const getOptionStyle = (index) => {
    if (!showFeedback) {
      return index === selectedOption ? styles.selectedOption : styles.option;
    }

    if (index === problem.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (index === selectedOption) {
      return [styles.option, styles.incorrectOption];
    }

    return styles.option;
  };

  const getOptionTextStyle = (index) => {
    if (!showFeedback) {
      return index === selectedOption ? styles.selectedOptionText : styles.optionText;
    }

    if (index === problem.correctAnswer) {
      return [styles.optionText, styles.correctOptionText];
    }

    if (index === selectedOption) {
      return [styles.optionText, styles.incorrectOptionText];
    }

    return styles.optionText;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.problemNumber}>Problem {problemNumber} of {totalProblems}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{problem.difficulty.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.question}>{problem.question}</Text>

      <View style={styles.optionsContainer}>
        {problem.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionPress(index)}
            disabled={showFeedback}
          >
            <Text style={getOptionTextStyle(index)}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showFeedback && (
        <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
          <Text style={styles.feedbackTitle}>
            {isCorrect ? 'Correct! ✅' : 'Incorrect ❌'}
          </Text>
          <Text style={styles.feedbackText}>
            {problem.explanation || 'The correct answer is: ' + problem.options[problem.correctAnswer]}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  problemNumber: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectedOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  correctOption: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  incorrectOption: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
  correctOptionText: {
    fontSize: 16,
    color: '#047857',
    fontWeight: '600',
  },
  incorrectOptionText: {
    fontSize: 16,
    color: '#b91c1c',
    fontWeight: '600',
  },
  feedbackContainer: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
