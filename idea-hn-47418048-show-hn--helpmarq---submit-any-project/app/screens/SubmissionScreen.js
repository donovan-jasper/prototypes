import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import SubmissionForm from '../components/SubmissionForm';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SubmissionScreen = ({ navigation }) => {
  const handleSubmit = async (submission) => {
    try {
      // Add submission to Firebase
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...submission,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // Navigate to FeedbackScreen with the generated ID
      navigation.navigate('Feedback', { submissionId: docRef.id });
    } catch (error) {
      console.error('Error saving submission:', error);
      Alert.alert('Error', 'Failed to save submission. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Work</Text>
      <SubmissionForm onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SubmissionScreen;
