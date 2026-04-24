import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { saveDecision } from '../utils/storage';
import { calculateBetaDistribution } from '../utils/betaDistribution';

interface QuizProps {
  onComplete: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [description, setDescription] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
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

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Calibration Quiz</Text>

      <TextInput
        style={styles.input}
        placeholder="What decision did you make?"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Actual value"
        keyboardType="numeric"
        value={actualValue}
        onChangeText={setActualValue}
      />

      <TextInput
        style={styles.input}
        placeholder="Your estimate"
        keyboardType="numeric"
        value={estimatedValue}
        onChangeText={setEstimatedValue}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedback: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default Quiz;
