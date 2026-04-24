import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import FeedbackForm from '../components/FeedbackForm';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackScreen = ({ route }) => {
  const { submissionId } = route.params;
  const [feedbackResults, setFeedbackResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;

    const q = query(
      collection(db, 'feedback'),
      where('submissionId', '==', submissionId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push(doc.data());
      });

      if (feedbackData.length > 0) {
        // Calculate average score if multiple feedbacks
        const totalScore = feedbackData.reduce((sum, feedback) => sum + feedback.score, 0);
        const averageScore = (totalScore / feedbackData.length).toFixed(1);

        setFeedbackResults({
          ...feedbackData[0],
          score: averageScore,
          count: feedbackData.length
        });
      } else {
        setFeedbackResults(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [submissionId]);

  const handleSubmit = (feedback) => {
    // This would be handled by the FeedbackForm component
    // when submitting to Firestore
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Feedback Results</Text>

      {feedbackResults ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Feedback Summary</Text>
          <Text style={styles.feedbackCount}>{feedbackResults.count} responses</Text>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Average Clarity:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question1}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Would Use:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question2}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Average Rating:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question3}/10</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Final Score: {feedbackResults.score}/10</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noFeedbackContainer}>
          <Text style={styles.noFeedbackText}>No feedback received yet</Text>
          <Text style={styles.noFeedbackSubtext}>Share your submission link to get feedback</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Provide Your Feedback</Text>
        <FeedbackForm onSubmit={handleSubmit} submissionId={submissionId} />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  feedbackCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
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
  noFeedbackContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  noFeedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  noFeedbackSubtext: {
    fontSize: 14,
    color: '#888',
  },
  formContainer: {
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
});

export default FeedbackScreen;
