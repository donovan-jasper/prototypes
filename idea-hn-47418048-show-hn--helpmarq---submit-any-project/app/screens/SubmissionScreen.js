import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SubmissionForm from '../components/SubmissionForm';

const SubmissionScreen = ({ navigation }) => {
  const handleSubmit = (submission) => {
    // Handle submission logic here
    console.log('Submission:', submission);
    navigation.navigate('Feedback');
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default SubmissionScreen;
