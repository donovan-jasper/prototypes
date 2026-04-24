import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import SubmissionForm from '../components/SubmissionForm';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStripe } from '@stripe/stripe-react-native';

const SubmissionScreen = ({ navigation }) => {
  const [showSprintModal, setShowSprintModal] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSubmit = async (submission, isSprint = false) => {
    try {
      // Add submission to Firebase with priority if it's a sprint
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...submission,
        createdAt: serverTimestamp(),
        status: 'pending',
        priority: isSprint ? 'high' : 'normal'
      });

      // If it's a sprint, add to sprint queue collection
      if (isSprint) {
        await addDoc(collection(db, 'sprintQueue'), {
          submissionId: docRef.id,
          createdAt: serverTimestamp(),
          status: 'queued'
        });
      }

      // Navigate to FeedbackScreen with the generated ID
      navigation.navigate('Feedback', { submissionId: docRef.id });
    } catch (error) {
      console.error('Error saving submission:', error);
      Alert.alert('Error', 'Failed to save submission. Please try again.');
    }
  };

  const handleSprintSubmit = async (submission) => {
    try {
      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Critiq',
        paymentIntentClientSecret: 'YOUR_CLIENT_SECRET', // Replace with actual client secret from your backend
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Payment failed', paymentError.message);
        return;
      }

      // If payment succeeds, proceed with sprint submission
      await handleSubmit(submission, true);
      Alert.alert('Success', 'Your sprint submission has been processed!');
    } catch (error) {
      console.error('Error processing sprint:', error);
      Alert.alert('Error', 'Failed to process sprint submission.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Work</Text>
      <SubmissionForm onSubmit={handleSubmit} />

      <TouchableOpacity
        style={styles.sprintButton}
        onPress={() => setShowSprintModal(true)}
      >
        <Text style={styles.sprintButtonText}>Submit as Sprint ($20)</Text>
      </TouchableOpacity>

      <Modal
        visible={showSprintModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSprintModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Feedback Sprint</Text>
            <Text style={styles.modalText}>
              Get 3 reviews in 24 hours for $20. Your submission will be prioritized.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSprintModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowSprintModal(false);
                  // In a real app, you would get the submission data from the form
                  // For this example, we'll just create a dummy submission
                  const dummySubmission = {
                    type: 'sprint',
                    file: 'dummy.png',
                    questions: [],
                    answers: {}
                  };
                  handleSprintSubmit(dummySubmission);
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sprintButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sprintButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SubmissionScreen;
