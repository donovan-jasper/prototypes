import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import FeedbackForm from '../components/FeedbackForm';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackScreen = ({ route }) => {
  const { submissionId, templateType, reviewerId, isSubmitter } = route.params;
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
      where('submissionId', '==', submissionId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push({ id: doc.id, ...doc.data() });
      });

      if (feedbackData.length > 0) {
        // Calculate average scores
        const totalClarity = feedbackData.reduce((sum, feedback) => sum + (feedback.clarity || 0), 0);
        const totalWouldUse = feedbackData.reduce((sum, feedback) => sum + (feedback.wouldUse || 0), 0);
        const totalRating = feedbackData.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);

        const averageClarity = (totalClarity / feedbackData.length).toFixed(1);
        const averageWouldUse = (totalWouldUse / feedbackData.length).toFixed(1);
        const averageRating = (totalRating / feedbackData.length).toFixed(1);

        // Calculate overall average score
        const totalScore = totalClarity + totalWouldUse + totalRating;
        const averageScore = (totalScore / (feedbackData.length * 3)).toFixed(1);

        setFeedbackResults({
          clarity: averageClarity,
          wouldUse: averageWouldUse,
          rating: averageRating,
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
      <Text style={styles.reviewerName}>{item.reviewerId || 'Anonymous'}</Text>

      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Clarity:</Text>
          <Text style={styles.scoreValue}>{item.clarity || 'N/A'}/10</Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Would Use:</Text>
          <Text style={styles.scoreValue}>{item.wouldUse || 'N/A'}/10</Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Rating:</Text>
          <Text style={styles.scoreValue}>{item.rating || 'N/A'}/10</Text>
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
            <Text style={styles.resultValue}>{feedbackResults.clarity}/10</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Would Use:</Text>
            <Text style={styles.resultValue}>{feedbackResults.wouldUse}/10</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Average Rating:</Text>
            <Text style={styles.resultValue}>{feedbackResults.rating}/10</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Overall Score:</Text>
            <Text style={styles.resultValue}>{feedbackResults.score}/10</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noFeedbackText}>No feedback yet. Be the first to submit!</Text>
      )}

      {individualFeedback.length > 0 && (
        <View style={styles.individualFeedbackContainer}>
          <Text style={styles.sectionTitle}>Individual Feedback</Text>
          <FlatList
            data={individualFeedback}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {!isSubmitter && (
        <FeedbackForm
          onSubmit={handleSubmit}
          submissionId={submissionId}
          templateType={templateType}
          reviewerId={reviewerId}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
    fontWeight: '600',
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  individualFeedbackContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
    color: '#007AFF',
  },
  commentContainer: {
    marginTop: 10,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default FeedbackScreen;
