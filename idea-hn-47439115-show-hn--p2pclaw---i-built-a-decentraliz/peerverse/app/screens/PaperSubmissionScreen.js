import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
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
  const [showQueue, setShowQueue] = useState(false);
  const [failedSubmissions, setFailedSubmissions] = useState([]);
  const [completedSubmissions, setCompletedSubmissions] = useState([]);

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

      setFailedSubmissions(failedSubmissions);
      setCompletedSubmissions(completedSubmissions);
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
        createdAt: new Date().toISOString()
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
        await saveSubmissionLocally({ ...submission, id: localId });
        updateStepStatus('ipfs', 'completed');
        setCurrentStep(3);

        // Step 4: Firebase Submission
        updateStepStatus('firebase', 'processing');
        const firebaseId = await submitToFirebase({
          ...submission,
          ipfsHash: ipfsHash
        });

        if (!firebaseId) {
          throw new Error('Firebase submission failed');
        }

        submission.firebaseId = firebaseId;
        submission.status = 'completed';
        await saveSubmissionLocally({ ...submission, id: localId });
        updateStepStatus('firebase', 'completed');

        navigation.navigate('SubmissionConfirmation', {
          submissionData: {
            ...submission,
            id: localId
          }
        });
      } else {
        updateStepStatus('proof', 'completed');
        updateStepStatus('ipfs', 'pending');
        updateStepStatus('firebase', 'pending');
        Alert.alert('Offline Mode', 'Your submission has been saved locally and will be processed when you connect to the internet.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      updateStepStatus(submissionSteps[currentStep].id, 'failed', error.message);
      Alert.alert('Submission Failed', error.message);
    } finally {
      setIsSubmitting(false);
      updateQueueStatus();
    }
  };

  const handleRetryFailed = async (submissionId) => {
    try {
      await retryFailedStep(submissionId);
      Alert.alert('Retry Started', 'The submission will be retried when online');
      updateQueueStatus();
    } catch (error) {
      Alert.alert('Retry Failed', error.message);
    }
  };

  const renderStepIndicator = (step, index) => {
    let iconName;
    let color;

    switch (step.status) {
      case 'completed':
        iconName = 'checkmark-circle';
        color = '#34C759';
        break;
      case 'processing':
        iconName = 'time-outline';
        color = '#FF9500';
        break;
      case 'failed':
        iconName = 'close-circle';
        color = '#FF3B30';
        break;
      default:
        iconName = 'ellipse-outline';
        color = '#8E8E93';
    }

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepIndicator}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        <Text style={[styles.stepLabel, { color: step.status === 'failed' ? '#FF3B30' : '#333' }]}>
          {step.label}
        </Text>
        {step.status === 'failed' && step.error && (
          <Text style={styles.errorText}>{step.error}</Text>
        )}
        {index < submissionSteps.length - 1 && (
          <View style={[styles.stepConnector, { backgroundColor: index < currentStep ? '#34C759' : '#E5E5EA' }]} />
        )}
      </View>
    );
  };

  const renderQueueItem = ({ item }) => (
    <View style={styles.queueItem}>
      <View style={styles.queueItemHeader}>
        <Text style={styles.queueItemTitle}>{item.title}</Text>
        <Text style={[styles.queueItemStatus, {
          color: item.status === 'failed' ? '#FF3B30' : item.status === 'completed' ? '#34C759' : '#FF9500'
        }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.queueItemAuthors}>{item.authors}</Text>
      {item.status === 'failed' && (
        <View style={styles.queueItemActions}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetryFailed(item.id)}
          >
            <Ionicons name="refresh" size={16} color="#007AFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>{item.last_error}</Text>
        </View>
      )}
      {item.status === 'completed' && item.firebase_id && (
        <View style={styles.verificationStatus}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.verificationText}>Verified on blockchain</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Submit Research Paper</Text>
        <Text style={styles.subtitle}>Submit your research with cryptographic verification</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.networkStatus}>
          <Ionicons
            name={isOnline ? 'wifi' : 'cloud-offline'}
            size={20}
            color={isOnline ? '#34C759' : '#FF3B30'}
          />
          <Text style={[styles.networkStatusText, { color: isOnline ? '#34C759' : '#FF3B30' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.queueToggle}
          onPress={() => setShowQueue(!showQueue)}
        >
          <Text style={styles.queueToggleText}>
            {showQueue ? 'Hide Queue' : 'Show Queue'}
          </Text>
          <Ionicons
            name={showQueue ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {showQueue && (
        <View style={styles.queueContainer}>
          <View style={styles.queueSummary}>
            <View style={styles.queueSummaryItem}>
              <Text style={styles.queueSummaryLabel}>Pending</Text>
              <Text style={styles.queueSummaryValue}>{queueStatus.pendingCount}</Text>
            </View>
            <View style={styles.queueSummaryItem}>
              <Text style={styles.queueSummaryLabel}>Processing</Text>
              <Text style={styles.queueSummaryValue}>{queueStatus.processingCount}</Text>
            </View>
            <View style={styles.queueSummaryItem}>
              <Text style={styles.queueSummaryLabel}>Completed</Text>
              <Text style={styles.queueSummaryValue}>{queueStatus.completedCount}</Text>
            </View>
            <View style={styles.queueSummaryItem}>
              <Text style={styles.queueSummaryLabel}>Failed</Text>
              <Text style={styles.queueSummaryValue}>{queueStatus.failedCount}</Text>
            </View>
          </View>

          {failedSubmissions.length > 0 && (
            <View style={styles.queueSection}>
              <Text style={styles.queueSectionTitle}>Failed Submissions</Text>
              <FlatList
                data={failedSubmissions}
                renderItem={renderQueueItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {completedSubmissions.length > 0 && (
            <View style={styles.queueSection}>
              <Text style={styles.queueSectionTitle}>Completed Submissions</Text>
              <FlatList
                data={completedSubmissions}
                renderItem={renderQueueItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.stepsContainer}>
        {submissionSteps.map((step, index) => renderStepIndicator(step, index))}
      </View>

      <PaperSubmissionForm onSubmit={handleSubmit} />

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing submission...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkStatusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  queueToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueToggleText: {
    color: '#007AFF',
    fontSize: 16,
    marginRight: 4,
  },
  stepsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  stepLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepConnector: {
    position: 'absolute',
    top: 40,
    left: 19,
    width: 2,
    height: 40,
    zIndex: 0,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  queueContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 20,
  },
  queueSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  queueSummaryItem: {
    alignItems: 'center',
  },
  queueSummaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  queueSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  queueSection: {
    marginBottom: 20,
  },
  queueSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  queueItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  queueItemStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  queueItemAuthors: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  queueItemActions: {
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verificationText: {
    color: '#34C759',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default PaperSubmissionScreen;
