import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { fetchReviews } from '../services/reviews';
import { saveResponse } from '../services/responses';

const ReviewsScreen = ({ route }) => {
  const { appId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      const reviewsData = await fetchReviews(appId);
      setReviews(reviewsData);
    };

    loadReviews();
  }, [appId]);

  const handleRespond = (review) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (selectedReview && responseText.trim()) {
      await saveResponse(selectedReview.id, responseText);
      setReviews(reviews.map(review =>
        review.id === selectedReview.id
          ? { ...review, responded: true, response: responseText }
          : review
      ));
      setModalVisible(false);
      setResponseText('');
    }
  };

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
            {item.responded && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Your Response:</Text>
                <Text>{item.response}</Text>
              </View>
            )}
            {!item.responded && (
              <TouchableOpacity
                style={styles.respondButton}
                onPress={() => handleRespond(item)}
              >
                <Text style={styles.respondButtonText}>Respond</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Review</Text>
            <TextInput
              style={styles.responseInput}
              multiline
              placeholder="Type your response here..."
              value={responseText}
              onChangeText={setResponseText}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="#888"
              />
              <Button
                title="Send Response"
                onPress={handleSendResponse}
                disabled={!responseText.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  responseContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
  },
  responseLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  responseInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReviewsScreen;
