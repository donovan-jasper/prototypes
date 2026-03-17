import React from 'react';
import { View, Text, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';

interface PremiumGateProps {
  isPremium: boolean;
  featureName: string;
  onUpgrade: () => void;
}

export default function PremiumGate({ isPremium, featureName, onUpgrade }: PremiumGateProps) {
  const [showModal, setShowModal] = React.useState(false);

  if (isPremium) {
    return null;
  }

  return (
    <>
      <Button
        title={`Unlock ${featureName}`}
        onPress={() => setShowModal(true)}
        color="#FF9500"
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Premium Feature</Text>
            <Text style={styles.modalText}>
              {featureName} is a premium feature. Upgrade to MorseMate Premium to unlock:
            </Text>

            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>✓ Custom SOS messages</Text>
              <Text style={styles.benefitItem}>✓ Flashlight SOS signaling</Text>
              <Text style={styles.benefitItem}>✓ Ad-free experience</Text>
              <Text style={styles.benefitItem}>✓ Multiplayer challenges</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>$3.99/month</Text>
              <Text style={styles.annualPrice}>or $29.99/year (save 37%)</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.upgradeButton]}
                onPress={() => {
                  setShowModal(false);
                  onUpgrade();
                }}
              >
                <Text style={[styles.buttonText, styles.upgradeText]}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  benefitsList: {
    marginBottom: 25,
  },
  benefitItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  annualPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeText: {
    color: 'white',
  },
});
