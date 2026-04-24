import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';
import { processSubmissionQueue } from '../../services/localStorage';
import { verifyProof } from '../../utils/crypto';
import { openDatabase } from 'react-native-sqlite-storage';

const database = openDatabase({ name: 'peerverse.db' });

const PaperSubmissionScreen = () => {
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    setVerificationResult(null);

    try {
      // Store submission in local DB
      await new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'INSERT INTO submissions (title, authors, content) VALUES (?, ?, ?)',
            [formData.title, formData.authors, formData.abstract],
            () => resolve(),
            (_, error) => reject(error)
          );
        });
      });

      // Process the submission queue
      await processSubmissionQueue();

      // Get the latest submission to verify
      const latestSubmission = await new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM submissions ORDER BY id DESC LIMIT 1',
            [],
            (_, { rows }) => resolve(rows._array[0]),
            (_, error) => reject(error)
          );
        });
      });

      if (latestSubmission && latestSubmission.proof) {
        // Verify the proof
        const isValid = verifyProof(latestSubmission.content, latestSubmission.proof);
        setVerificationResult({
          valid: isValid,
          message: isValid
            ? 'Proof verification successful! Your submission is cryptographically verified.'
            : 'Proof verification failed. The content may have been tampered with.'
        });
      }

      setSubmissionStatus({
        success: true,
        message: 'Paper submitted successfully!',
        data: formData
      });

      Alert.alert('Success', 'Your paper has been submitted for review');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus({
        success: false,
        message: 'Failed to submit paper. Please try again.'
      });
      Alert.alert('Error', 'Failed to submit paper. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Submit Your Research Paper</Text>
        <Text style={styles.subtitle}>Fill in the details below to submit your paper for peer review</Text>
      </View>

      <PaperSubmissionForm onSubmit={handleSubmit} />

      {isSubmitting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Submitting your paper...</Text>
        </View>
      )}

      {submissionStatus && (
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            submissionStatus.success ? styles.successText : styles.errorText
          ]}>
            {submissionStatus.message}
          </Text>

          {verificationResult && (
            <View style={[
              styles.verificationContainer,
              verificationResult.valid ? styles.verificationSuccess : styles.verificationFailed
            ]}>
              <Text style={styles.verificationTitle}>
                {verificationResult.valid ? '✓ Verification Successful' : '✗ Verification Failed'}
              </Text>
              <Text style={styles.verificationMessage}>
                {verificationResult.message}
              </Text>
            </View>
          )}

          {submissionStatus.success && (
            <View style={styles.submittedData}>
              <Text style={styles.dataTitle}>Submitted Paper:</Text>
              <Text style={styles.dataItem}>Title: {submissionStatus.data.title}</Text>
              <Text style={styles.dataItem}>Authors: {submissionStatus.data.authors}</Text>
              <Text style={styles.dataItem}>Abstract: {submissionStatus.data.abstract.substring(0, 100)}...</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#ff4444',
  },
  verificationContainer: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  verificationSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  verificationFailed: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
    borderLeftWidth: 4,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  verificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  submittedData: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dataItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
});

export default PaperSubmissionScreen;
