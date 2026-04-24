import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView, FlatList, Modal } from 'react-native';
import PaperSubmissionForm from '../components/PaperSubmissionForm';
import SubmissionProgressTracker from '../components/SubmissionProgressTracker';
import { processSubmissionQueue, getSubmissions, retrySubmission } from '../../services/localStorage';
import { generateSubmissionProof, verifySubmissionProof } from '../../utils/crypto';
import { openDatabase } from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import { firebase } from '../../services/firebase';

const database = openDatabase({ name: 'peerverse.db' });

const PaperSubmissionScreen = () => {
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [steps, setSteps] = useState([
    { id: 1, title: 'Form Validation', status: 'pending' },
    { id: 2, title: 'Proof Generation', status: 'pending' },
    { id: 3, title: 'Local Storage', status: 'pending' },
    { id: 4, title: 'Queue Processing', status: 'pending' },
    { id: 5, title: 'Verification', status: 'pending' },
    { id: 6, title: 'Firebase Submission', status: 'pending' },
    { id: 7, title: 'Completion', status: 'pending' }
  ]);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [showQueueModal, setShowQueueModal] = useState(false);

  useEffect(() => {
    // Initialize database tables
    database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS submissions (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'title TEXT, ' +
        'authors TEXT, ' +
        'content TEXT, ' +
        'proof TEXT, ' +
        'status TEXT DEFAULT "pending", ' +
        'currentStep TEXT, ' +
        'completedSteps TEXT, ' +
        'failedStep TEXT, ' +
        'ipfsHash TEXT, ' +
        'createdAt DATETIME DEFAULT CURRENT_TIMESTAMP' +
        ');'
      );
    });

    // Load submissions
    loadSubmissions();

    // Check network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const loadSubmissions = async () => {
    try {
      const loadedSubmissions = await getSubmissions();
      setSubmissions(loadedSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      Alert.alert('Error', 'Failed to load submissions. Please try again.');
    }
  };

  const updateStepStatus = (stepId, status) => {
    setSteps(prevSteps => prevSteps.map(step =>
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    setVerificationResult(null);
    setCurrentStep(1);
    setShowProgress(true);
    setSubmissionComplete(false);

    // Reset all steps to pending
    setSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'pending' })));

    try {
      // Step 1: Form validation (handled by PaperSubmissionForm)
      updateStepStatus(1, 'completed');

      // Step 2: Generate proof
      setCurrentStep(2);
      updateStepStatus(2, 'in-progress');
      const proof = await generateSubmissionProof(formData.abstract, formData.authors);
      updateStepStatus(2, 'completed');

      // Step 3: Store submission in local DB
      setCurrentStep(3);
      updateStepStatus(3, 'in-progress');
      const submissionId = await new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'INSERT INTO submissions (title, authors, content, proof, status, currentStep) VALUES (?, ?, ?, ?, ?, ?)',
            [formData.title, formData.authors, formData.abstract, JSON.stringify(proof), 'pending', 'localSave'],
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        });
      });
      updateStepStatus(3, 'completed');

      // Step 4: Process the submission queue
      setCurrentStep(4);
      updateStepStatus(4, 'in-progress');
      await processSubmissionQueue();
      updateStepStatus(4, 'completed');

      // Step 5: Get the latest submission to verify
      setCurrentStep(5);
      updateStepStatus(5, 'in-progress');
      const latestSubmission = await new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM submissions WHERE id = ?',
            [submissionId],
            (_, { rows }) => resolve(rows.item(0)),
            (_, error) => reject(error)
          );
        });
      });

      // Verify the proof
      const isValid = await verifySubmissionProof(
        JSON.parse(latestSubmission.proof),
        latestSubmission.content
      );

      if (!isValid) {
        throw new Error('Proof verification failed');
      }
      updateStepStatus(5, 'completed');

      // Step 6: Submit to Firebase if online
      if (isOnline) {
        setCurrentStep(6);
        updateStepStatus(6, 'in-progress');
        const submissionRef = firebase.firestore().collection('submissions').doc();
        await submissionRef.set({
          title: latestSubmission.title,
          authors: latestSubmission.authors,
          abstract: latestSubmission.content,
          proof: latestSubmission.proof,
          status: 'submitted',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          ipfsHash: latestSubmission.ipfsHash || null
        });

        // Update local status
        await new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              'UPDATE submissions SET status = ?, ipfsHash = ? WHERE id = ?',
              ['completed', submissionRef.id, latestSubmission.id],
              () => resolve(),
              (_, error) => reject(error)
            );
          });
        });
        updateStepStatus(6, 'completed');
      } else {
        updateStepStatus(6, 'pending');
      }

      // Step 7: Completion
      setCurrentStep(7);
      updateStepStatus(7, 'completed');
      setSubmissionStatus('success');
      setSubmissionComplete(true);
      setSubmissionData(latestSubmission);
      setIpfsHash(latestSubmission.ipfsHash || null);
      loadSubmissions();
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionStatus('failed');
      setSteps(prevSteps => prevSteps.map(step =>
        step.id === currentStep ? { ...step, status: 'failed' } : step
      ));
      Alert.alert('Submission Failed', error.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (submissionId) => {
    try {
      setIsSubmitting(true);
      await retrySubmission(submissionId);
      await loadSubmissions();
      Alert.alert('Success', 'Submission retried successfully');
    } catch (error) {
      console.error('Retry failed:', error);
      Alert.alert('Error', 'Failed to retry submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmissionItem = ({ item }) => (
    <View style={styles.submissionItem}>
      <Text style={styles.submissionTitle}>{item.title}</Text>
      <Text style={styles.submissionAuthors}>{item.authors}</Text>
      <Text style={styles.submissionStatus}>Status: {item.status}</Text>
      {item.status === 'failed' && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => handleRetry(item.id)}
          disabled={isSubmitting}
        >
          <Text style={styles.retryButtonText}>Retry Submission</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Submit Research Paper</Text>

        {!submissionComplete ? (
          <>
            <PaperSubmissionForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />

            {showProgress && (
              <SubmissionProgressTracker
                steps={steps}
                currentStep={currentStep}
              />
            )}

            {isSubmitting && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Processing submission...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Submission Complete!</Text>
            <Text style={styles.successMessage}>
              Your paper "{submissionData?.title}" has been successfully submitted.
            </Text>
            {ipfsHash && (
              <Text style={styles.ipfsHash}>IPFS Hash: {ipfsHash}</Text>
            )}
            <TouchableOpacity
              style={styles.newSubmissionButton}
              onPress={() => {
                setSubmissionComplete(false);
                setSubmissionStatus(null);
                setShowProgress(false);
              }}
            >
              <Text style={styles.newSubmissionButtonText}>Submit Another Paper</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.submissionQueueContainer}>
          <Text style={styles.queueTitle}>Submission Queue</Text>
          {submissions.length > 0 ? (
            <FlatList
              data={submissions}
              renderItem={renderSubmissionItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.submissionList}
            />
          ) : (
            <Text style={styles.emptyQueue}>No submissions in queue</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showQueueModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQueueModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submission Queue</Text>
            <FlatList
              data={submissions}
              renderItem={renderSubmissionItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQueueModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  ipfsHash: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  newSubmissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newSubmissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submissionQueueContainer: {
    marginTop: 30,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  submissionList: {
    paddingBottom: 20,
  },
  submissionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  submissionAuthors: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  submissionStatus: {
    fontSize: 14,
    color: '#007AFF',
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyQueue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalList: {
    maxHeight: 300,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PaperSubmissionScreen;
