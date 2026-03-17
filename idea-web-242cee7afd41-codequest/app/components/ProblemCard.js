import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProblemCard({ problem, onAnswer, problemNumber, totalProblems }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleOptionPress = (index) => {
    if (answered) return;
    
    setSelectedOption(index);
    setAnswered(true);
    
    const isCorrect = index === problem.correctAnswer;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 800);
  };

  const getOptionStyle = (index) => {
    if (!answered) {
      return selectedOption === index ? styles.optionSelected : styles.option;
    }
    
    if (index === problem.correctAnswer) {
      return styles.optionCorrect;
    }
    
    if (index === selectedOption && index !== problem.correctAnswer) {
      return styles.optionIncorrect;
    }
    
    return styles.option;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.problemNumber}>Problem {problemNumber} of {totalProblems}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{problem.domain.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.question}>{problem.question}</Text>
      
      <View style={styles.optionsContainer}>
        {problem.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionPress(index)}
            disabled={answered}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
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
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '700',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    backgroundColor: '#eef2ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  optionCorrect: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  optionIncorrect: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});
