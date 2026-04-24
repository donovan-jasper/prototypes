import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { fetchReviews } from '../services/reviews';

const ReviewsScreen = ({ route }) => {
  const { appId } = route.params;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      const reviewsData = await fetchReviews(appId);
      setReviews(reviewsData);
    };

    loadReviews();
  }, [appId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text>Rating: {item.rating}</Text>
            <TouchableOpacity style={styles.respondButton}>
              <Text style={styles.respondButtonText}>Respond</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  respondButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#fff',
  },
});

export default ReviewsScreen;
