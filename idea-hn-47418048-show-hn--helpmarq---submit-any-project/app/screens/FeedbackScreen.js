import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FeedbackForm from '../components/FeedbackForm';

const FeedbackScreen = () => {
  const handleSubmit = (feedback) => {
    // Handle feedback logic here
    console.log('Feedback:', feedback);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Provide Feedback</Text>
      <FeedbackForm onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default FeedbackScreen;
