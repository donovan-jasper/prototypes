import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { insertSessionReport } from '../lib/database';

interface SafetyButtonProps {
  sessionId: string;
  onEndCall: () => void;
}

const SafetyButton: React.FC<SafetyButtonProps> = ({ sessionId, onEndCall }) => {
  const [showModal, setShowModal] = useState(false);

  const handleReport = async () => {
    try {
      await insertSessionReport({
        id: `report_${Date.now()}`,
        sessionId,
        timestamp: Date.now(),
        reason: 'User initiated report',
        status: 'pending'
      });
      Alert.alert('Report Submitted', 'Your report has been submitted to moderators.');
      onEndCall();
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.safetyButton}
        onPress={() => setShowModal(true)}
      >
        <MaterialIcons name="report" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Call and Report</Text>
            <Text style={styles.modalText}>
              Are you sure you want to end this call and report it to moderators?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.reportButton]}
                onPress={handleReport}
              >
                <Text style={styles.modalButtonText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safetyButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#ff3b30',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
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
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  reportButton: {
    backgroundColor: '#ff3b30',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SafetyButton;
