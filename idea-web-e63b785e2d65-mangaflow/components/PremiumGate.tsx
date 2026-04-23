import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useUserStore } from '../store/user';
import { validateSubscription } from '../lib/premium';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ visible, onClose, onUpgrade }) => {
  const { isPremium, setPremiumStatus } = useUserStore();

  const handleUpgrade = async () => {
    try {
      // In a real app, this would trigger the purchase flow
      // For now, we'll simulate a successful purchase
      const success = await validateSubscription('valid_receipt_123');

      if (success) {
        setPremiumStatus(true, Date.now() + (30 * 24 * 60 * 60 * 1000));
        Alert.alert('Success', 'Your premium subscription is active!');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to validate subscription. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during purchase. Please try again.');
    }
  };

  if (isPremium) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Upgrade to Premium</Text>

          <View style={styles.featureList}>
            <Text style={styles.feature}>✓ Unlimited library size</Text>
            <Text style={styles.feature}>✓ Cloud sync across devices</Text>
            <Text style={styles.feature}>✓ Advanced organization tools</Text>
            <Text style={styles.feature}>✓ Reading statistics</Text>
            <Text style={styles.feature}>✓ Priority support</Text>
          </View>

          <View style={styles.pricingContainer}>
            <View style={styles.priceOption}>
              <Text style={styles.price}>$3.99/month</Text>
              <Text style={styles.billing}>Billed monthly</Text>
            </View>
            <View style={styles.priceOption}>
              <Text style={styles.price}>$29.99/year</Text>
              <Text style={styles.billing}>Save 37% ($2.50/month)</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
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
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  featureList: {
    width: '100%',
    marginBottom: 20,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  priceOption: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  billing: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PremiumGate;
