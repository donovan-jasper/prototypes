import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';
import { uploadToIPFS } from '../services/ipfs';
import { generateProof } from '../utils/crypto';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const PaperSubmissionScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (paper) => {
    setIsSubmitting(true);
    try {
      // Upload to IPFS
      const cid = await uploadToIPFS(JSON.stringify(paper));

      // Generate cryptographic proof
      const proof = await generateProof(JSON.stringify(paper));

      // Store in Firebase
      await addDoc(collection(db, 'papers'), {
        cid,
        proof,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Your paper has been successfully submitted!');
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit paper. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Research Paper</Text>
      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Submitting your paper...</Text>
        </View>
      ) : (
        <PaperSubmissionForm onSubmit={handleSubmit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default PaperSubmissionScreen;
