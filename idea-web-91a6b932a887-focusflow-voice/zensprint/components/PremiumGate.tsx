import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ visible, onClose, feature }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#636e72" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={50} color="#6c5ce7" />
          </View>

          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.message}>
            To unlock {feature}, please upgrade to our premium plan.
          </Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
              <Text style={styles.benefitText}>Unlimited pods</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
              <Text style={styles.benefitText}>Custom session lengths</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
              <Text style={styles.benefitText}>Premium voice packs</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
              <Text style={styles.benefitText}>Advanced analytics</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  benefitText: {
    fontSize: 14,
    color: '#636e72',
    marginLeft: 5,
  },
  upgradeButton: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PremiumGate;
