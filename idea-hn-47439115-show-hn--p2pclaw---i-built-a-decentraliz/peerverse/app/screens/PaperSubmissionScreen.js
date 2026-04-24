import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';
import { saveSubmissionLocally, initializeDatabase, processSubmissionQueue, retryFailedStep, getPendingSubmissions, getProcessingSubmissions, getCompletedSubmissions, getFailedSubmissions } from '../services/localStorage';
import { generateProof, verifyProof } from '../utils/crypto';
import { uploadToIPFS } from '../services/ipfs';
import { submitToFirebase } from '../services/firebase';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

const PaperSubmissionScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [submissionSteps, setSubmissionSteps] = useState([
    { id: 'local', label: 'Local Save', status: 'pending', error: null },
    { id: 'proof', label: 'Proof Generation', status: 'pending', error: null },
    { id: 'ipfs', label: 'IPFS Upload', status: 'pending', error: null },
    { id: 'firebase', label: 'Firebase Submission', status: 'pending', error: null }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionData, setSubmissionData] = useState(null);
  const [queueStatus, setQueueStatus] = useState({
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    // Initialize database
    initializeDatabase();

    // Set up network listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        processSubmissionQueue();
      }
    });

    // Update queue status periodically
    const interval = setInterval(updateQueueStatus, 5000);
    updateQueueStatus();

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateQueueStatus = async () => {
    try {
      const pendingSubmissions = await getPendingSubmissions();
      const processingSubmissions = await getProcessingSubmissions();
      const completedSubmissions = await getCompletedSubmissions();
      const failedSubmissions = await getFailedSubmissions();

      setQueueStatus({
        pendingCount: pendingSubmissions.length,
        processingCount: processingSubmissions.length,
        completedCount: completedSubmissions.length,
        failedCount: failedSubmissions.length
      });
    } catch (error) {
      console.error('Error updating queue status:', error);
    }
  };

  const updateStepStatus = (stepId, status, error = null) => {
    setSubmissionSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status, error } : step
      )
    );
  };

  const handleSubmit = async (paperData) => {
    setIsSubmitting(true);
    setCurrentStep(0);

    try {
      // Reset steps status
      setSubmissionSteps(prevSteps =>
        prevSteps.map(step => ({ ...step, status: 'pending', error: null }))
      );

      // Step 1: Local Save
      updateStepStatus('local', 'processing');
      const contentString = JSON.stringify(paperData);
      const proof = await generateProof(contentString);
      const isValid = await verifyProof(contentString, proof);

      if (!isValid) {
        throw new Error('Generated proof verification failed');
      }

      const submission = {
        title: paperData.title,
        authors: paperData.authors,
        abstract: paperData.abstract,
        content: contentString,
        proof: proof,
        status: 'pending',
        createdAt: new Date().toISOString(),
        verificationStatus: {
          proof: 'verified',
          ipfs: 'pending',
          firebase: 'pending'
        }
      };

      setSubmissionData(submission);
      const localId = await saveSubmissionLocally(submission);
      updateStepStatus('local', 'completed');
      setCurrentStep(1);

      // If online, proceed with full submission
      if (isOnline) {
        // Step 2: Proof Generation (already done)
        updateStepStatus('proof', 'completed');
        setCurrentStep(2);

        // Step 3: IPFS Upload
        updateStepStatus('ipfs', 'processing');
        const ipfsHash = await uploadToIPFS(contentString);
        if (!ipfsHash) {
          throw new Error('IPFS upload failed');
        }
        submission.ipfsHash = ipfsHash;
        submission.verificationStatus.ipfs = 'verified';
        await saveSubmissionLocally({ ...submission, id: localId });
        updateStepStatus('ipfs', 'completed');
        setCurrentStep(3);

        // Step 4: Firebase Submission
        updateStepStatus('firebase', 'processing');
        const firebaseResult = await submitToFirebase({
          ...submission,
          ipfsHash: ipfsHash
        });

        if (!firebaseResult || !firebaseResult.id) {
          throw new Error('Firebase submission failed');
        }

        // Update submission status
        submission.status = 'completed';
        submission.firebaseId = firebaseResult.id;
        submission.verificationStatus.firebase = 'verified';
        await saveSubmissionLocally({ ...submission, id: localId });

        updateStepStatus('firebase', 'completed');
        setCurrentStep(4);

        // Navigate to success screen
        navigation.navigate('SubmissionSuccess', {
          submissionId: firebaseResult.id,
          ipfsHash: ipfsHash
        });
      } else {
        // If offline, just show success with local ID
        navigation.navigate('SubmissionSuccess', {
          submissionId: localId,
          isLocal: true
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Submission Failed', error.message || 'An error occurred during submission');

      // Update the failed step
      const failedStep = submissionSteps.find(step => step.status === 'processing');
      if (failedStep) {
        updateStepStatus(failedStep.id, 'failed', error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = (step, index) => {
    let iconName;
    let color;

    switch (step.status) {
      case 'completed':
        iconName = 'checkmark-circle';
        color = '#4CAF50';
        break;
      case 'processing':
        iconName = 'time';
        color = '#FFC107';
        break;
      case 'failed':
        iconName = 'close-circle';
        color = '#F44336';
        break;
      default:
        iconName = 'ellipse-outline';
        color = '#9E9E9E';
    }

    return (
      <View style={styles.stepContainer} key={step.id}>
        <View style={styles.stepIndicator}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        <Text style={[styles.stepLabel, { color: step.status === 'failed' ? '#F44336' : '#333' }]}>
          {step.label}
        </Text>
        {step.status === 'failed' && step.error && (
          <Text style={styles.errorText}>{step.error}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Submit Research Paper</Text>
        <Text style={styles.subtitle}>Submit your paper with cryptographic verification</Text>
      </View>

      <PaperSubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isSubmitting && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Submission Progress</Text>
          {submissionSteps.map((step, index) => renderStepIndicator(step, index))}
        </View>
      )}

      <View style={styles.queueStatusContainer}>
        <Text style={styles.queueTitle}>Submission Queue</Text>
        <View style={styles.queueStatusRow}>
          <View style={styles.queueStatusItem}>
            <Text style={styles.queueStatusValue}>{queueStatus.pendingCount}</Text>
            <Text style={styles.queueStatusLabel}>Pending</Text>
          </View>
          <View style={styles.queueStatusItem}>
            <Text style={styles.queueStatusValue}>{queueStatus.processingCount}</Text>
            <Text style={styles.queueStatusLabel}>Processing</Text>
          </View>
          <View style={styles.queueStatusItem}>
            <Text style={styles.queueStatusValue}>{queueStatus.completedCount}</Text>
            <Text style={styles.queueStatusLabel}>Completed</Text>
          </View>
          <View style={styles.queueStatusItem}>
            <Text style={[styles.queueStatusValue, { color: queueStatus.failedCount > 0 ? '#F44336' : '#333' }]}>
              {queueStatus.failedCount}
            </Text>
            <Text style={styles.queueStatusLabel}>Failed</Text>
          </View>
        </View>
      </View>

      {queueStatus.failedCount > 0 && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={processSubmissionQueue}
          disabled={isSubmitting}
        >
          <Text style={styles.retryButtonText}>Retry Failed Submissions</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  progressContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    marginRight: 12,
  },
  stepLabel: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  queueStatusContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  queueStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queueStatusItem: {
    alignItems: 'center',
  },
  queueStatusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  queueStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PaperSubmissionScreen;
