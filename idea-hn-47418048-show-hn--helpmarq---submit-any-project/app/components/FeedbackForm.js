import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackForm = ({ onSubmit, submissionId }) => {
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [score, setScore] = useState(null);

  const calculateScore = () => {
    let total = 0;
    let count = 0;

    if (question1.toLowerCase() === 'yes') {
      total += 7;
      count++;
    } else if (question1.toLowerCase() === 'no') {
      total += 3;
      count++;
    }

    if (question2.toLowerCase() === 'yes') {
      total += 8;
      count++;
    } else if (question2.toLowerCase() === 'no') {
      total += 2;
      count++;
    }

    if (question3) {
      const num = parseInt(question3);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        total += num;
        count++;
      }
    }

    if (count > 0) {
      const calculatedScore = Math.round(total / count);
      setScore(calculatedScore);
      return calculatedScore;
    }
    return null;
  };

  const handleSubmit = async () => {
    const calculatedScore = calculateScore();

    if (!calculatedScore) {
      Alert.alert('Error', 'Please answer all questions before submitting');
      return;
    }

    try {
      const feedbackData = {
        submissionId,
        question1: question1.toLowerCase() === 'yes' ? 7 : 3,
        question2: question2.toLowerCase() === 'yes' ? 8 : 2,
        question3: parseInt(question3) || 0,
        score: calculatedScore,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'feedback'), feedbackData);

      if (onSubmit) {
        onSubmit(feedbackData);
      }

      // Reset form
      setQuestion1('');
      setQuestion2('');
      setQuestion3('');
      setScore(null);

      Alert.alert('Success', 'Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Is this clear?</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, question1 === 'Yes' && styles.radioButtonSelected]}
          onPress={() => setQuestion1('Yes')}
        >
          <Text style={styles.radioText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, question1 === 'No' && styles.radioButtonSelected]}
          onPress={() => setQuestion1('No')}
        >
          <Text style={styles.radioText}>No</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>Would you use this?</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, question2 === 'Yes' && styles.radioButtonSelected]}
          onPress={() => setQuestion2('Yes')}
        >
          <Text style={styles.radioText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, question2 === 'No' && styles.radioButtonSelected]}
          onPress={() => setQuestion2('No')}
        >
          <Text style={styles.radioText}>No</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>Rate this from 1-10</Text>
      <TextInput
        style={styles.input}
        value={question3}
        onChangeText={setQuestion3}
        placeholder="1-10"
        keyboardType="numeric"
      />

      {score !== null && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Your Score: {score}/10</Text>
        </View>
      )}

      <Button title="Submit Feedback" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radioText: {
    color: 'black',
  },
  scoreContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default FeedbackForm;
