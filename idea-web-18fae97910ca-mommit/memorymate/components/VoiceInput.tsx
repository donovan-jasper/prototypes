import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemoryStore } from '../store/memoryStore';
import * as Speech from 'expo-speech';
import { parseNaturalLanguage } from '../lib/ai';

const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [capturedText, setCapturedText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedReminder, setParsedReminder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMemory } = useMemoryStore();

  const handleVoiceInput = async () => {
    setIsRecording(true);
    try {
      // Simulate voice recording - in real implementation, this would use actual speech recognition
      const result = await new Promise<string>((resolve) => {
        setTimeout(() => resolve('Remind me to call mom tomorrow at 5 PM'), 2000);
      });

      // Wait for user to stop speaking
      let isSpeaking = true;
      while (isSpeaking) {
        isSpeaking = await Speech.isSpeakingAsync();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setCapturedText(result);
      setShowEditModal(true);
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Failed to capture voice input');
    } finally {
      setIsRecording(false);
    }
  };

  const handleProcessText = async () => {
    if (!capturedText.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setIsProcessing(true);
    setShowEditModal(false);

    try {
      const parsed = await parseNaturalLanguage(capturedText);
      
      if (!parsed) {
        Alert.alert(
          'Parsing Failed',
          'Could not understand your reminder. Please check your OpenAI API key in Settings or try rephrasing.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      setParsedReminder(parsed);
      setShowConfirmModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to process reminder. Please try again.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedReminder) {
      addMemory({
        title: parsedReminder.title,
        description: parsedReminder.description,
        trigger_type: parsedReminder.trigger_type,
        trigger_value: parsedReminder.trigger_value,
        completed: false,
      });
      
      setShowConfirmModal(false);
      setCapturedText('');
      setParsedReminder(null);
      Alert.alert('Success', 'Reminder created successfully');
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setCapturedText('');
    setParsedReminder(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleVoiceInput} disabled={isRecording}>
        <Ionicons name="mic" size={24} color={isRecording ? 'red' : 'black'} />
        <Text style={styles.buttonText}>{isRecording ? 'Recording...' : 'Voice Input'}</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Reminder</Text>
            <TextInput
              style={styles.textInput}
              value={capturedText}
              onChangeText={setCapturedText}
              multiline
              numberOfLines={4}
              placeholder="Enter your reminder..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setCapturedText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleProcessText}
              >
                <Text style={styles.confirmButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Indicator */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Reminder</Text>
            {parsedReminder && (
              <View style={styles.reminderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title:</Text>
                  <Text style={styles.detailValue}>{parsedReminder.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{parsedReminder.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trigger Type:</Text>
                  <Text style={styles.detailValue}>{parsedReminder.trigger_type}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trigger Value:</Text>
                  <Text style={styles.detailValue}>{parsedReminder.trigger_value}</Text>
                </View>
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
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
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  processingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  reminderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default VoiceInput;
