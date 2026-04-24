import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import FeedbackForm from '../components/FeedbackForm';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackScreen = ({ route }) => {
  const { submissionId } = route.params;
  const [feedbackResults, setFeedbackResults] = useState(null);
  const [individualFeedback, setIndividualFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) {
      setLoading(false);
      return;
    }

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
        // Calculate average scores for each question
        const totalQuestion1 = feedbackData.reduce((sum, feedback) => sum + (feedback.question1 || 0), 0);
        const totalQuestion2 = feedbackData.reduce((sum, feedback) => sum + (feedback.question2 || 0), 0);
        const totalQuestion3 = feedbackData.reduce((sum, feedback) => sum + (feedback.question3 || 0), 0);

        const averageQuestion1 = (totalQuestion1 / feedbackData.length).toFixed(1);
        const averageQuestion2 = (totalQuestion2 / feedbackData.length).toFixed(1);
        const averageQuestion3 = (totalQuestion3 / feedbackData.length).toFixed(1);

        // Calculate overall average score
        const totalScore = feedbackData.reduce((sum, feedback) => sum + (feedback.score || 0), 0);
        const averageScore = (totalScore / feedbackData.length).toFixed(1);

        setFeedbackResults({
          question1: averageQuestion1,
          question2: averageQuestion2,
          question3: averageQuestion3,
          score: averageScore,
          count: feedbackData.length
        });

        // Store individual feedback for display
        setIndividualFeedback(feedbackData);
      } else {
        setFeedbackResults(null);
        setIndividualFeedback([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feedback:", error);
      Alert.alert('Error', 'Failed to load feedback. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [submissionId]);

  const handleSubmit = (feedback) => {
    // Feedback is automatically saved to Firestore via FeedbackForm
    // This callback is just for any additional UI updates if needed
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.reviewerName}>{item.reviewerName || 'Anonymous'}</Text>

      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Clarity:</Text>
          <Text style={styles.scoreValue}>{item.question1 || 'N/A'}/10</Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Would Use:</Text>
          <Text style={styles.scoreValue}>{item.question2 || 'N/A'}/10</Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Rating:</Text>
          <Text style={styles.scoreValue}>{item.question3 || 'N/A'}/10</Text>
        </View>
      </View>

      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Comment:</Text>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}
    </View>
  );

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
            <Text style={styles.resultValue}>{feedbackResults.question1}/10</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Would Use:</Text>
            <Text style={styles.resultValue}>{feedbackResults.question2}/10</Text>
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

      {individualFeedback.length > 0 && (
        <View style={styles.individualFeedbackContainer}>
          <Text style={styles.sectionTitle}>Individual Reviews</Text>
          <FlatList
            data={individualFeedback}
            renderItem={renderFeedbackItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
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
    color: '#333',
  },
  feedbackCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#444',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scoreContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86DE',
    textAlign: 'center',
  },
  noFeedbackContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
  individualFeedbackContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  feedbackItem: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  scoresContainer: {
    marginBottom: 10,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  commentContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
});

export default FeedbackScreen;
