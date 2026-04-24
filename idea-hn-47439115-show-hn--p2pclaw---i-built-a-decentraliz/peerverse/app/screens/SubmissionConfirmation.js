import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SubmissionConfirmation = ({ route, navigation }) => {
  const { submissionData } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.confirmationBox}>
        <Text style={styles.title}>Submission Successful!</Text>
        <Text style={styles.subtitle}>Your paper has been submitted to PeerVerse</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Title:</Text>
          <Text style={styles.detailValue}>{submissionData.title}</Text>

          <Text style={styles.detailLabel}>Authors:</Text>
          <Text style={styles.detailValue}>{submissionData.authors}</Text>

          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={styles.detailValue}>Processing</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  confirmationBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubmissionConfirmation;
