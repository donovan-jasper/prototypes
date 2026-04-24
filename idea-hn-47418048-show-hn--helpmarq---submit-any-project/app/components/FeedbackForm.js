import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Slider } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackForm = ({ onSubmit, submissionId, templateType, reviewerId }) => {
  const [clarity, setClarity] = useState(5);
  const [wouldUse, setWouldUse] = useState(5);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      const feedbackData = {
        submissionId,
        reviewerId,
        templateType,
        clarity,
        wouldUse,
        rating,
        comment,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'feedback'), feedbackData);

      if (onSubmit) {
        onSubmit(feedbackData);
      }

      // Reset form
      setClarity(5);
      setWouldUse(5);
      setRating(5);
      setComment('');

      Alert.alert('Success', 'Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clarity (1-10)</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={clarity}
        onValueChange={setClarity}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#007AFF"
      />
      <Text style={styles.value}>{clarity}</Text>

      <Text style={styles.label}>Would Use (1-10)</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={wouldUse}
        onValueChange={setWouldUse}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#007AFF"
      />
      <Text style={styles.value}>{wouldUse}</Text>

      <Text style={styles.label}>Rating (1-10)</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={rating}
        onValueChange={setRating}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#007AFF"
      />
      <Text style={styles.value}>{rating}</Text>

      <Text style={styles.label}>Additional comments (optional)</Text>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder="Enter your comments here..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  value: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackForm;
