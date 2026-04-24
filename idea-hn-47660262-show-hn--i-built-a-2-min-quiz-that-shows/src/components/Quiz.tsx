import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { saveDecision, initDatabase } from '../utils/storage';
import { calculateBetaDistribution } from '../utils/betaDistribution';

interface QuizProps {
  onComplete: () => void;
  currentQuestion: number;
  totalQuestions: number;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, currentQuestion, totalQuestions }) => {
  const [description, setDescription] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Database Error', 'Failed to initialize database');
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  const handleSubmit = async () => {
    if (isLoading || isSubmitting) return;

    if (!description || !actualValue || !estimatedValue) {
      setFeedback('Please fill all fields');
      return;
    }

    const actual = parseFloat(actualValue);
    const estimated = parseFloat(estimatedValue);

    if (isNaN(actual) || isNaN(estimated)) {
      setFeedback('Please enter valid numbers');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');

    try {
      const difference = Math.abs(actual - estimated);
      const percentageError = (difference / actual) * 100;

      // Simple calibration: 1 success if within 20%, otherwise 1 failure
      const successes = percentageError <= 20 ? 1 : 0;
      const failures = percentageError > 20 ? 1 : 0;

      await saveDecision({
        description,
        actualValue: actual,
        estimatedValue: estimated,
        successes,
        failures
      });

      const betaResult = calculateBetaDistribution(successes, failures);
      setFeedback(`Your calibration score: ${betaResult.mean.toFixed(2)} (${betaResult.confidenceInterval[0].toFixed(2)}-${betaResult.confidenceInterval[1].toFixed(2)})`);

      // Reset form
      setDescription('');
      setActualValue('');
      setEstimatedValue('');

      setTimeout(() => {
        setIsSubmitting(false);
        onComplete();
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save decision');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Question {currentQuestion} of {totalQuestions}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentQuestion / totalQuestions) * 100}%` }]} />
        </View>
      </View>

      <Text style={styles.title}>Daily Calibration Quiz</Text>

      <TextInput
        style={styles.input}
        placeholder="What decision did you make?"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#999"
        editable={!isSubmitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Actual value"
        keyboardType="numeric"
        value={actualValue}
        onChangeText={setActualValue}
        placeholderTextColor="#999"
        editable={!isSubmitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Your estimate"
        keyboardType="numeric"
        value={estimatedValue}
        onChangeText={setEstimatedValue}
        placeholderTextColor="#999"
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!description || !actualValue || !estimatedValue || isSubmitting) && styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!description || !actualValue || !estimatedValue || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedback: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
});

export default Quiz;
