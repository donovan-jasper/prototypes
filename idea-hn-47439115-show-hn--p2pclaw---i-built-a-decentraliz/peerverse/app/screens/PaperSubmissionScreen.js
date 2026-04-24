import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';

const PaperSubmissionScreen = () => {
  const handleSubmit = (paper) => {
    console.log('Submitted paper:', paper);
    // TODO: Add logic to submit paper to IPFS and Firebase
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Research Paper</Text>
      <PaperSubmissionForm onSubmit={handleSubmit} />
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default PaperSubmissionScreen;
