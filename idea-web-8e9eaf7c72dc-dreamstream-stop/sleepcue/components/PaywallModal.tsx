import React from 'react';
import { View, Text, StyleSheet, Button, Modal } from 'react-native';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function PaywallModal({ visible, onClose, onPurchase }: PaywallModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock all features</Text>

          <View style={styles.featureList}>
            <Text style={styles.feature}>✓ Unlimited smart sleep detection</Text>
            <Text style={styles.feature}>✓ Custom rewind amounts</Text>
            <Text style={styles.feature}>✓ Sleep insights dashboard</Text>
            <Text style={styles.feature}>✓ Multiple profiles</Text>
            <Text style={styles.feature}>✓ Advanced battery stats</Text>
            <Text style={styles.feature}>✓ Priority support</Text>
          </View>

          <View style={styles.pricingContainer}>
            <Text style={styles.price}>$3.99/month</Text>
            <Text style={styles.annualPrice}>or $29.99/year (save 37%)</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Upgrade Now" onPress={onPurchase} />
            <Button title="Maybe Later" onPress={onClose} color="gray" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    width: '80%',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  featureList: {
    marginBottom: 20,
    width: '100%',
  },
  feature: {
    fontSize: 16,
    marginBottom: 5,
  },
  pricingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  annualPrice: {
    fontSize: 14,
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
