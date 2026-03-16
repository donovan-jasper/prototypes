import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const UpgradeModal = ({ visible, onClose, onUpgrade }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Upgrade to Pro</Text>

          <View style={styles.featureComparison}>
            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Unlimited audiobooks</Text>
              <Text style={styles.freeFeature}>✓</Text>
              <Text style={styles.paidFeature}>✓</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Smart auto-chapter</Text>
              <Text style={styles.freeFeature}>✗</Text>
              <Text style={styles.paidFeature}>✓</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Custom cover art</Text>
              <Text style={styles.freeFeature}>✗</Text>
              <Text style={styles.paidFeature}>✓</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Playback analytics</Text>
              <Text style={styles.freeFeature}>✗</Text>
              <Text style={styles.paidFeature}>✓</Text>
            </View>
          </View>

          <Text style={styles.price}>$4.99 one-time</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureComparison: {
    width: '100%',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featureText: {
    flex: 2,
  },
  freeFeature: {
    flex: 1,
    textAlign: 'center',
    color: '#4CD964',
  },
  paidFeature: {
    flex: 1,
    textAlign: 'center',
    color: '#007AFF',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default UpgradeModal;
