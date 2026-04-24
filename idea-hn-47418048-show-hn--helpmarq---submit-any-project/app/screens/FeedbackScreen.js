import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FeedbackForm from '../components/FeedbackForm';

const FeedbackScreen = () => {
  const [feedbackResults, setFeedbackResults] = useState(null);

  const handleSubmit = (feedback) => {
    setFeedbackResults(feedback);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Provide Feedback</Text>

      <FeedbackForm onSubmit={handleSubmit} />

      {feedbackResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Feedback Results</Text>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Clarity:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question1}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Would Use:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question2}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Rating:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question3}/10</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Final Score: {feedbackResults.score}/10</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default FeedbackScreen;
