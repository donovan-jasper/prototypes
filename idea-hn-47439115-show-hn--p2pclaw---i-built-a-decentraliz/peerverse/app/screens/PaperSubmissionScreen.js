import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';
import { uploadToIPFS } from '../services/ipfs';
import { generateProof, verifyProof } from '../utils/crypto';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const PaperSubmissionScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofStatus, setProofStatus] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [submissionStep, setSubmissionStep] = useState(0);

  const handleSubmit = async (paper) => {
    setIsSubmitting(true);
    setSubmissionStep(1);
    setProofStatus('Generating proof...');

    try {
      // Generate cryptographic proof
      const proof = await generateProof(JSON.stringify(paper));
      setProofStatus('Proof generated successfully');
      setSubmissionStep(2);

      // Verify the proof
      setVerificationStatus('Verifying proof...');
      setSubmissionStep(3);
      const isValid = await verifyProof(JSON.stringify(paper), proof);

      if (!isValid) {
        throw new Error('Proof verification failed');
      }

      setVerificationStatus('Proof verified successfully');
      setSubmissionStep(4);

      // Upload to IPFS
      setVerificationStatus('Uploading to IPFS...');
      setSubmissionStep(5);
      const cid = await uploadToIPFS(JSON.stringify(paper));

      // Store in Firebase
      setVerificationStatus('Storing in database...');
      setSubmissionStep(6);
      await addDoc(collection(db, 'papers'), {
        cid,
        proof,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        createdAt: new Date(),
      });

      setSubmissionStep(7);
      Alert.alert('Success', 'Your paper has been successfully submitted and verified!');
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit paper. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusIndicator = () => {
    const steps = [
      'Generating proof',
      'Proof generated',
      'Verifying proof',
      'Proof verified',
      'Uploading to IPFS',
      'Storing in database',
      'Complete'
    ];

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              submissionStep > index ? styles.stepActive : null
            ]}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={[
              styles.stepText,
              submissionStep > index ? styles.stepTextActive : null
            ]}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Research Paper</Text>

      {isSubmitting ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          {renderStatusIndicator()}
          <Text style={styles.statusText}>{proofStatus}</Text>
          {verificationStatus && <Text style={styles.statusText}>{verificationStatus}</Text>}
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
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  stepsContainer: {
    marginVertical: 20,
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    color: '#999',
    fontSize: 14,
  },
  stepTextActive: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default PaperSubmissionScreen;
